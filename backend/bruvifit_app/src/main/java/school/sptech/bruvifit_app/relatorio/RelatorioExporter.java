package school.sptech.bruvifit_app.relatorio;

import org.springframework.stereotype.Component;
import org.apache.pdfbox.pdmodel.*;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Component
public class RelatorioExporter {
    public byte[] csv(RelatorioResponse report) {
        StringBuilder out=new StringBuilder("\uFEFF");
        out.append(String.join(";",report.columns().stream().map(c -> escape(c.label())).toList())).append("\r\n");
        for(var row:report.rows()) out.append(String.join(";",report.columns().stream().map(c -> escape(csvValue(row.get(c.key()),c.format()))).toList())).append("\r\n");
        return out.toString().getBytes(StandardCharsets.UTF_8);
    }
    static String escape(String value) {
        String text=value==null?"":value;
        // Protect formulas even behind whitespace/control characters. All cells remain quoted.
        if(text.stripLeading().matches("(?s)^[=+@-].*")) text="'"+text;
        return "\""+text.replace("\"","\"\"")+"\"";
    }
    private static String csvValue(Object value,String format) {
        if(value==null) return "";
        if(value instanceof Number) return value.toString().replace('.',',');
        return display(value,format);
    }
    static String display(Object value,String format) {
        if(value==null) return "Não informado";
        if("money".equals(format)) return NumberFormat.getCurrencyInstance(Locale.forLanguageTag("pt-BR")).format(RelatorioService.decimal(value));
        if(value instanceof LocalDateTime date) return date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
        if(value instanceof LocalDate date) return date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        return value.toString();
    }
    public byte[] pdf(RelatorioResponse report) throws IOException {
        try(PDDocument doc=new PDDocument(); ByteArrayOutputStream out=new ByteArrayOutputStream()) {
            doc.getDocumentInformation().setTitle(report.title());
            doc.getDocumentInformation().setAuthor("Bruvifit");
            try(PdfTable table=new PdfTable(doc,report)) { table.render(); }
            for(int i=0;i<doc.getNumberOfPages();i++) {
                var page=doc.getPage(i);
                try(var stream=new PDPageContentStream(doc,page,PDPageContentStream.AppendMode.APPEND,true,true)) {
                    stream.beginText(); stream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA),9); stream.newLineAtOffset(36,22);
                    stream.showText("Bruvifit | "+report.title()+" | Página "+(i+1)+" de "+doc.getNumberOfPages()); stream.endText();
                }
            }
            doc.save(out); return out.toByteArray();
        }
    }
    private static class PdfTable implements AutoCloseable {
        private final PDDocument doc;
        private final RelatorioResponse report;
        private final PDFont regular=new PDType1Font(Standard14Fonts.FontName.HELVETICA);
        private final PDFont bold=new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
        private PDPageContentStream stream;
        private final float width=PDRectangle.A3.getHeight()-72;
        private float y;
        PdfTable(PDDocument doc,RelatorioResponse report) { this.doc=doc;this.report=report; }
        void page() throws IOException {
            if(stream!=null) stream.close();
            PDPage page=new PDPage(new PDRectangle(PDRectangle.A3.getHeight(),PDRectangle.A3.getWidth())); doc.addPage(page);
            stream=new PDPageContentStream(doc,page); y=page.getMediaBox().getHeight()-40;
            text(report.title(),36,y,18,bold); y-=25;
            text("Emissão: "+display(report.emittedAt(),"datetime"),36,y,9,regular);y-=20;
        }
        void render() throws IOException {
            page();
            paragraph("Filtros: "+(report.filters().isEmpty()?"Todos os registros elegíveis":report.filters()),10);
            paragraph(report.criteria(),9);
            y-=8;
            for(var metric:report.metrics()) paragraph(metric.label()+": "+display(metric.value(),metric.format()),11);
            if(!report.groups().isEmpty()) {
                paragraph("Totais por categoria (itens de vendas / lançamentos elegíveis):",10);
                for(var e:report.groups().entrySet()) paragraph(e.getKey()+": "+display(e.getValue(),"money"),9);
            }
            y-=12; headers();
            if(report.rows().isEmpty()) paragraph("Nenhum registro encontrado para os filtros utilizados.",11);
            for(var row:report.rows()) {
                List<List<String>> cells=report.columns().stream().map(c -> wrap(display(row.get(c.key()),c.format()),width/report.columns().size()-12,8,regular)).toList();
                int lines=cells.stream().mapToInt(List::size).max().orElse(1);
                int offset=0;
                while(offset<lines) {
                    if(y<72) { page();headers(); }
                    int capacity=Math.max(1,(int)((y-48-8)/11));
                    int count=Math.min(capacity,lines-offset);
                    float cellWidth=width/report.columns().size();
                    for(int col=0;col<cells.size();col++) for(int l=0;l<count;l++) if(offset+l<cells.get(col).size()) text(cells.get(col).get(offset+l),42+col*cellWidth,y-12-l*11,8,regular);
                    float height=count*11+8;
                    stream.setStrokingColor(0.8f); stream.moveTo(36,y-height);stream.lineTo(36+width,y-height);stream.stroke();
                    y-=height;offset+=count;
                    if(offset<lines) { page();headers(); }
                }
            }
            y-=15; paragraph("Registros detalhados: "+report.rows().size()+". Valores e critérios conforme resumo acima.",9);
        }
        void headers() throws IOException {
            List<List<String>> labels=report.columns().stream().map(c -> wrap(c.label(),width/report.columns().size()-12,8,bold)).toList();
            int max=labels.stream().mapToInt(List::size).max().orElse(1);
            float height=max*11+12;
            if(y-height<60) page();
            stream.setNonStrokingColor(0.92f);stream.addRect(36,y-height,width,height);stream.fill();stream.setNonStrokingColor(0f);
            float colWidth=width/report.columns().size();
            for(int c=0;c<labels.size();c++) for(int line=0;line<labels.get(c).size();line++) text(labels.get(c).get(line),42+c*colWidth,y-12-line*11,8,bold);
            y-=height;
        }
        void paragraph(String value,int size) throws IOException {
            for(String line:wrap(value,width,size,regular)) {
                if(y<size+48) page();
                text(line,36,y,size,regular);y-=size+5;
            }
        }
        String clean(String value,PDFont font) {
            StringBuilder s=new StringBuilder();
            value.codePoints().forEach(cp -> {
                String ch=new String(Character.toChars(cp));
                if(Character.isISOControl(cp) || Character.isWhitespace(cp)) { s.append(' ');return; }
                try { font.encode(ch); s.append(ch); } catch(Exception ex) { s.append('?'); }
            });return s.toString();
        }
        List<String> wrap(String value,float maxWidth,int size,PDFont font) {
            String source=clean(value,font);List<String> lines=new ArrayList<>();StringBuilder current=new StringBuilder();
            for(String word:source.split("\\s+")) {
                String candidate=current.isEmpty()?word:current+" "+word;
                try {
                    if(font.getStringWidth(candidate)/1000*size<=maxWidth) { current=new StringBuilder(candidate);continue; }
                    if(!current.isEmpty()) { lines.add(current.toString());current.setLength(0); }
                    for(int i=0;i<word.length();i++) {
                        if(font.getStringWidth(current.toString()+word.charAt(i))/1000*size>maxWidth && !current.isEmpty()) { lines.add(current.toString());current.setLength(0); }
                        current.append(word.charAt(i));
                    }
                } catch(IOException ex) { throw new UncheckedIOException(ex); }
            }
            if(!current.isEmpty() || lines.isEmpty()) lines.add(current.toString());return lines;
        }
        void text(String value,float x,float baseline,int size,PDFont font) throws IOException {
            stream.beginText();stream.setFont(font,size);stream.newLineAtOffset(x,baseline);stream.showText(clean(value,font));stream.endText();
        }
        public void close() throws IOException { if(stream!=null) stream.close(); }
    }
}
