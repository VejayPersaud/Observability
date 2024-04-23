const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
//Removed ConsoleSpanExporter and replaced with JaegerExporter
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { trace } = require("@opentelemetry/api");

//Instrumentations
const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } = require("@opentelemetry/instrumentation-mongodb");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");

//Exporter
module.exports = (serviceName) => {
    //Configured JaegerExporter to send trace data to Jaeger collector
    const exporter = new JaegerExporter({
        //Jaeger collector endpoint
        endpoint: 'http://localhost:14268/api/traces',
        serviceName: serviceName,
    });

    const provider = new NodeTracerProvider({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
        }),
    });

    provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
    provider.register();

    registerInstrumentations({
        instrumentations: [
            new HttpInstrumentation(),
            new ExpressInstrumentation(),
            new MongoDBInstrumentation(),
        ],
        tracerProvider: provider,
    });

    return trace.getTracer(serviceName);
};
