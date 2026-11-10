package school.sptech.bruvifit_app;

import jakarta.persistence.Entity;
import org.hibernate.boot.MetadataSources;
import org.hibernate.boot.model.naming.CamelCaseToUnderscoresNamingStrategy;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.AnnotationTypeFilter;
import org.springframework.data.jpa.repository.support.JpaRepositoryFactory;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.*;

/** Compares the actual Hibernate metadata with the project's only SQL schema, without a database. */
class SchemaCompatibilityTest {
    @Test
    void sqlMatchesHibernateTablesAndColumns() throws Exception {
        String sql = Files.readString(Path.of("../../database.sql"));
        Map<String, Map<String, String>> tables = new HashMap<>();
        var tableMatcher = Pattern.compile("CREATE TABLE (\\w+) \\((.*?)\\);", Pattern.DOTALL).matcher(sql);
        while (tableMatcher.find()) {
            Map<String, String> columns = new HashMap<>();
            var columnMatcher = Pattern.compile(
                    "(?m)^\\s*(\\w+)\\s+((?:INT|VARCHAR|DECIMAL|TINYINT|DATETIME|DATE)\\b[^\\r\\n]*)",
                    Pattern.CASE_INSENSITIVE).matcher(tableMatcher.group(2));
            while (columnMatcher.find()) {
                columns.put(columnMatcher.group(1), columnMatcher.group(2).toLowerCase(Locale.ROOT));
            }
            tables.put(tableMatcher.group(1), columns);
        }

        var registry = new StandardServiceRegistryBuilder()
                .applySetting("hibernate.dialect", "org.hibernate.dialect.MySQLDialect")
                .applySetting("hibernate.temp.use_jdbc_metadata_defaults", false)
                .applySetting("hibernate.type.preferred_boolean_jdbc_type", "TINYINT")
                .build();
        try {
            var sources = new MetadataSources(registry);
            var scanner = new ClassPathScanningCandidateComponentProvider(false);
            scanner.addIncludeFilter(new AnnotationTypeFilter(Entity.class));
            for (var entity : scanner.findCandidateComponents("school.sptech.bruvifit_app")) {
                sources.addAnnotatedClass(Class.forName(entity.getBeanClassName()));
            }
            var metadata = sources.getMetadataBuilder()
                    .applyPhysicalNamingStrategy(new CamelCaseToUnderscoresNamingStrategy()).build();
            assertEquals(11, metadata.getEntityBindings().size());
            Set<String> mappedTables = new HashSet<>();
            for (var entity : metadata.getEntityBindings()) {
                var table = entity.getTable();
                String tableName = table.getName();
                mappedTables.add(tableName);
                assertTrue(tables.containsKey(tableName), tableName);
                Set<String> mappedColumns = new HashSet<>();
                for (var column : table.getColumns()) {
                    String name = column.getName();
                    String context = tableName + "." + name;
                    mappedColumns.add(name);
                    String definition = tables.get(tableName).get(name);
                    assertNotNull(definition, context);
                    String type = column.getSqlType(metadata).toLowerCase(Locale.ROOT).replace("integer", "int");
                    // DATETIME precision is optional in the SQL and does not change JDBC compatibility.
                    assertTrue(definition.replace(" ", "").startsWith(type.replace(" ", "")
                            .replaceAll("datetime\\(\\d+\\)", "datetime")), context + ": " + type + " / " + definition);
                    boolean notNull = definition.contains("not null") || definition.contains("primary key");
                    assertEquals(!column.isNullable(), notNull, context + " nullability");
                    if (column.isUnique()) {
                        assertTrue(Pattern.compile("UNIQUE KEY \\w+ \\(" + name + "\\)")
                                .matcher(sql).find(), context + " unique key");
                    }
                }
                assertEquals(tables.get(tableName).keySet(), mappedColumns, tableName);
            }
            assertEquals(tables.keySet(), mappedTables);
            // Relationships are represented by scalar IDs in Java; ensure every SQL FK targets a mapped column.
            var foreignKeys = Pattern.compile("FOREIGN KEY \\((\\w+)\\) REFERENCES (\\w+) \\((\\w+)\\)")
                    .matcher(sql);
            int count = 0;
            while (foreignKeys.find()) {
                assertTrue(tables.get(foreignKeys.group(2)).containsKey(foreignKeys.group(3)));
                count++;
            }
            assertEquals(10, count);
            // Creating each Spring Data repository validates derived methods and JPQL without executing SQL.
            try (var sessionFactory = metadata.buildSessionFactory();
                 var entityManager = sessionFactory.createEntityManager()) {
                var repositoryFactory = new JpaRepositoryFactory(entityManager);
                for (var entity : metadata.getEntityBindings()) {
                    repositoryFactory.getRepository(Class.forName(entity.getClassName() + "Repository"));
                }
            }
        } finally {
            StandardServiceRegistryBuilder.destroy(registry);
        }
    }
}
