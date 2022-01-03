import fetch from 'isomorphic-unfetch';
import { withTestServer } from './server-test-utils';
import { createZodJsonRpcServer } from './server';
import { createZodJsonRpcClient } from './client';
import { Router } from 'express';

test('it works', async () => {
  const { default: methods } = await import('./example-server');
  const router = Router();
  router.use('/rpc', createZodJsonRpcServer(methods));
  await withTestServer(router, async (port) => {
    const request = createZodJsonRpcClient<typeof methods>(
      `http://localhost:${port}/rpc`
    );
    const response = await request('hello', { name: 'pete' });
    expect(response).toEqual({ message: 'hello, pete!' });

    const schema = await (
      await fetch(`http://localhost:${port}/rpc/schema`)
    ).text();
    expect(schema).toMatchInlineSnapshot(`
"{
    \\"$schema\\": \\"http://json-schema.org/draft-06/schema#\\",
    \\"definitions\\": {
        \\"HelloArg\\": {
            \\"type\\": \\"object\\",
            \\"additionalProperties\\": false,
            \\"properties\\": {
                \\"name\\": {
                    \\"type\\": \\"string\\"
                }
            },
            \\"required\\": [
                \\"name\\"
            ],
            \\"title\\": \\"HelloArg\\"
        },
        \\"HelloRet\\": {
            \\"type\\": \\"object\\",
            \\"additionalProperties\\": false,
            \\"properties\\": {
                \\"message\\": {
                    \\"type\\": \\"string\\"
                }
            },
            \\"required\\": [
                \\"message\\"
            ],
            \\"title\\": \\"HelloRet\\"
        },
        \\"ServerGetSchemaArg\\": {
            \\"type\\": \\"object\\",
            \\"additionalProperties\\": false,
            \\"properties\\": {
                \\"lang\\": {
                    \\"type\\": \\"string\\"
                },
                \\"pattern\\": {
                    \\"type\\": \\"string\\"
                }
            },
            \\"required\\": [],
            \\"title\\": \\"ServerGetSchemaArg\\"
        },
        \\"ServerGetSchemaRet\\": {
            \\"type\\": \\"object\\",
            \\"additionalProperties\\": false,
            \\"properties\\": {
                \\"source\\": {
                    \\"type\\": \\"string\\"
                }
            },
            \\"required\\": [
                \\"source\\"
            ],
            \\"title\\": \\"ServerGetSchemaRet\\"
        }
    }
}
"
`);

    const java = await (
      await fetch(`http://localhost:${port}/rpc/schema?lang=java`)
    ).text();

    return;
    expect(java).toMatchInlineSnapshot(`
"// Converter.java

// To use this code, add the following Maven dependency to your project:
//
//
//     com.fasterxml.jackson.core     : jackson-databind          : 2.9.0
//     com.fasterxml.jackson.datatype : jackson-datatype-jsr310   : 2.9.0
//
// Import this package:
//
//     import io.quicktype.Converter;
//
// Then you can deserialize a JSON string with
//
//     HelloArg data = Converter.HelloArgFromJsonString(jsonString);
//     HelloRet data = Converter.HelloRetFromJsonString(jsonString);
//     ServerGetSchemaArg data = Converter.ServerGetSchemaArgFromJsonString(jsonString);
//     ServerGetSchemaRet data = Converter.ServerGetSchemaRetFromJsonString(jsonString);

package io.quicktype;

import java.io.IOException;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import java.util.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.OffsetTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.temporal.ChronoField;

public class Converter {
    // Date-time helpers

    private static final DateTimeFormatter DATE_TIME_FORMATTER = new DateTimeFormatterBuilder()
            .appendOptional(DateTimeFormatter.ISO_DATE_TIME)
            .appendOptional(DateTimeFormatter.ISO_OFFSET_DATE_TIME)
            .appendOptional(DateTimeFormatter.ISO_INSTANT)
            .appendOptional(DateTimeFormatter.ofPattern(\\"yyyy-MM-dd HH:mm:ss.SX\\"))
            .appendOptional(DateTimeFormatter.ofPattern(\\"yyyy-MM-dd HH:mm:ssX\\"))
            .appendOptional(DateTimeFormatter.ofPattern(\\"yyyy-MM-dd HH:mm:ss\\"))
            .toFormatter()
            .withZone(ZoneOffset.UTC);

    public static OffsetDateTime parseDateTimeString(String str) {
        return ZonedDateTime.from(Converter.DATE_TIME_FORMATTER.parse(str)).toOffsetDateTime();
    }

    private static final DateTimeFormatter TIME_FORMATTER = new DateTimeFormatterBuilder()
            .appendOptional(DateTimeFormatter.ISO_TIME)
            .appendOptional(DateTimeFormatter.ISO_OFFSET_TIME)
            .parseDefaulting(ChronoField.YEAR, 2020)
            .parseDefaulting(ChronoField.MONTH_OF_YEAR, 1)
            .parseDefaulting(ChronoField.DAY_OF_MONTH, 1)
            .toFormatter()
            .withZone(ZoneOffset.UTC);

    public static OffsetTime parseTimeString(String str) {
        return ZonedDateTime.from(Converter.TIME_FORMATTER.parse(str)).toOffsetDateTime().toOffsetTime();
    }
    // Serialize/deserialize helpers

    public static HelloArg HelloArgFromJsonString(String json) throws IOException {
        return getHelloArgObjectReader().readValue(json);
    }

    public static String HelloArgToJsonString(HelloArg obj) throws JsonProcessingException {
        return getHelloArgObjectWriter().writeValueAsString(obj);
    }

    public static HelloRet HelloRetFromJsonString(String json) throws IOException {
        return getHelloRetObjectReader().readValue(json);
    }

    public static String HelloRetToJsonString(HelloRet obj) throws JsonProcessingException {
        return getHelloRetObjectWriter().writeValueAsString(obj);
    }

    public static ServerGetSchemaArg ServerGetSchemaArgFromJsonString(String json) throws IOException {
        return getServerGetSchemaArgObjectReader().readValue(json);
    }

    public static String ServerGetSchemaArgToJsonString(ServerGetSchemaArg obj) throws JsonProcessingException {
        return getServerGetSchemaArgObjectWriter().writeValueAsString(obj);
    }

    public static ServerGetSchemaRet ServerGetSchemaRetFromJsonString(String json) throws IOException {
        return getServerGetSchemaRetObjectReader().readValue(json);
    }

    public static String ServerGetSchemaRetToJsonString(ServerGetSchemaRet obj) throws JsonProcessingException {
        return getServerGetSchemaRetObjectWriter().writeValueAsString(obj);
    }

    private static ObjectReader HelloArgReader;
    private static ObjectWriter HelloArgWriter;

    private static void instantiateHelloArgMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.findAndRegisterModules();
        mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        SimpleModule module = new SimpleModule();
        module.addDeserializer(OffsetDateTime.class, new JsonDeserializer<OffsetDateTime>() {
            @Override
            public OffsetDateTime deserialize(JsonParser jsonParser, DeserializationContext deserializationContext) throws IOException, JsonProcessingException {
                String value = jsonParser.getText();
                return Converter.parseDateTimeString(value);
            }
        });
        mapper.registerModule(module);
        HelloArgReader = mapper.readerFor(HelloArg.class);
        HelloArgWriter = mapper.writerFor(HelloArg.class);
    }

    private static ObjectReader getHelloArgObjectReader() {
        if (HelloArgReader == null) instantiateHelloArgMapper();
        return HelloArgReader;
    }

    private static ObjectWriter getHelloArgObjectWriter() {
        if (HelloArgWriter == null) instantiateHelloArgMapper();
        return HelloArgWriter;
    }

    private static ObjectReader HelloRetReader;
    private static ObjectWriter HelloRetWriter;

    private static void instantiateHelloRetMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.findAndRegisterModules();
        mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        SimpleModule module = new SimpleModule();
        module.addDeserializer(OffsetDateTime.class, new JsonDeserializer<OffsetDateTime>() {
            @Override
            public OffsetDateTime deserialize(JsonParser jsonParser, DeserializationContext deserializationContext) throws IOException, JsonProcessingException {
                String value = jsonParser.getText();
                return Converter.parseDateTimeString(value);
            }
        });
        mapper.registerModule(module);
        HelloRetReader = mapper.readerFor(HelloRet.class);
        HelloRetWriter = mapper.writerFor(HelloRet.class);
    }

    private static ObjectReader getHelloRetObjectReader() {
        if (HelloRetReader == null) instantiateHelloRetMapper();
        return HelloRetReader;
    }

    private static ObjectWriter getHelloRetObjectWriter() {
        if (HelloRetWriter == null) instantiateHelloRetMapper();
        return HelloRetWriter;
    }

    private static ObjectReader ServerGetSchemaArgReader;
    private static ObjectWriter ServerGetSchemaArgWriter;

    private static void instantiateServerGetSchemaArgMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.findAndRegisterModules();
        mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        SimpleModule module = new SimpleModule();
        module.addDeserializer(OffsetDateTime.class, new JsonDeserializer<OffsetDateTime>() {
            @Override
            public OffsetDateTime deserialize(JsonParser jsonParser, DeserializationContext deserializationContext) throws IOException, JsonProcessingException {
                String value = jsonParser.getText();
                return Converter.parseDateTimeString(value);
            }
        });
        mapper.registerModule(module);
        ServerGetSchemaArgReader = mapper.readerFor(ServerGetSchemaArg.class);
        ServerGetSchemaArgWriter = mapper.writerFor(ServerGetSchemaArg.class);
    }

    private static ObjectReader getServerGetSchemaArgObjectReader() {
        if (ServerGetSchemaArgReader == null) instantiateServerGetSchemaArgMapper();
        return ServerGetSchemaArgReader;
    }

    private static ObjectWriter getServerGetSchemaArgObjectWriter() {
        if (ServerGetSchemaArgWriter == null) instantiateServerGetSchemaArgMapper();
        return ServerGetSchemaArgWriter;
    }

    private static ObjectReader ServerGetSchemaRetReader;
    private static ObjectWriter ServerGetSchemaRetWriter;

    private static void instantiateServerGetSchemaRetMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.findAndRegisterModules();
        mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        SimpleModule module = new SimpleModule();
        module.addDeserializer(OffsetDateTime.class, new JsonDeserializer<OffsetDateTime>() {
            @Override
            public OffsetDateTime deserialize(JsonParser jsonParser, DeserializationContext deserializationContext) throws IOException, JsonProcessingException {
                String value = jsonParser.getText();
                return Converter.parseDateTimeString(value);
            }
        });
        mapper.registerModule(module);
        ServerGetSchemaRetReader = mapper.readerFor(ServerGetSchemaRet.class);
        ServerGetSchemaRetWriter = mapper.writerFor(ServerGetSchemaRet.class);
    }

    private static ObjectReader getServerGetSchemaRetObjectReader() {
        if (ServerGetSchemaRetReader == null) instantiateServerGetSchemaRetMapper();
        return ServerGetSchemaRetReader;
    }

    private static ObjectWriter getServerGetSchemaRetObjectWriter() {
        if (ServerGetSchemaRetWriter == null) instantiateServerGetSchemaRetMapper();
        return ServerGetSchemaRetWriter;
    }
}

// HelloArg.java

package io.quicktype;

import com.fasterxml.jackson.annotation.*;

public class HelloArg {
    private String name;

    @JsonProperty(\\"name\\")
    public String getName() { return name; }
    @JsonProperty(\\"name\\")
    public void setName(String value) { this.name = value; }
}

// HelloRet.java

package io.quicktype;

import com.fasterxml.jackson.annotation.*;

public class HelloRet {
    private String message;

    @JsonProperty(\\"message\\")
    public String getMessage() { return message; }
    @JsonProperty(\\"message\\")
    public void setMessage(String value) { this.message = value; }
}

// ServerGetSchemaArg.java

package io.quicktype;

import com.fasterxml.jackson.annotation.*;

public class ServerGetSchemaArg {
    private String lang;
    private String pattern;

    @JsonProperty(\\"lang\\")
    public String getLang() { return lang; }
    @JsonProperty(\\"lang\\")
    public void setLang(String value) { this.lang = value; }

    @JsonProperty(\\"pattern\\")
    public String getPattern() { return pattern; }
    @JsonProperty(\\"pattern\\")
    public void setPattern(String value) { this.pattern = value; }
}

// ServerGetSchemaRet.java

package io.quicktype;

import com.fasterxml.jackson.annotation.*;

public class ServerGetSchemaRet {
    private String source;

    @JsonProperty(\\"source\\")
    public String getSource() { return source; }
    @JsonProperty(\\"source\\")
    public void setSource(String value) { this.source = value; }
}
"
`);
  });
});
