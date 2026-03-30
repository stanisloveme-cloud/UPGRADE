import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import fs from 'fs';
import path from 'path';

export class ApiValidator {
    private ajv: Ajv;
    private openApiSpec: any;

    constructor() {
        this.ajv = new Ajv({ strict: false, allErrors: true });
        addFormats(this.ajv);

        const specPath = path.resolve(__dirname, '../../openapi.json');
        if (!fs.existsSync(specPath)) {
            throw new Error(`OpenAPI spec not found at ${specPath}`);
        }

        const rawData = fs.readFileSync(specPath, 'utf8');
        this.openApiSpec = JSON.parse(rawData);
    }

    public validateResponse(pathPattern: string, method: string, statusCode: string, responseData: any): { valid: boolean; errors: any } {
        // Find path
        const pathObj = this.openApiSpec.paths[pathPattern];
        if (!pathObj) return { valid: false, errors: `Path ${pathPattern} not found in OpenAPI spec` };

        const operation = pathObj[method.toLowerCase()];
        if (!operation) return { valid: false, errors: `Method ${method} not found for path ${pathPattern}` };

        const responseSpec = operation.responses[statusCode];
        if (!responseSpec) return { valid: false, errors: `Status ${statusCode} not found for ${method} ${pathPattern}` };

        const schema = responseSpec.content?.['application/json']?.schema;
        
        // If there's no schema defined (e.g., void response), then any response is technically "valid"
        if (!schema) {
            return { valid: true, errors: null };
        }

        // Add components to the schema inline for resolution
        const fullSchema = {
            ...schema,
            components: this.openApiSpec.components
        };

        const validate = this.ajv.compile(fullSchema);
        const valid = validate(responseData);

        return {
            valid,
            errors: validate.errors
        };
    }
}

export const apiValidator = new ApiValidator();
