export const snapshot = `
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
`;
