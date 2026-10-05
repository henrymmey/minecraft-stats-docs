# Development

Development is split across the four repositories.

## Local order

For protocol-driven development, work in this order:

1. Server database and ingest API
2. OpenAPI contract
3. Dashboard
4. Client

Run the API tests before changing a protocol schema.

## Pull requests

Changes that affect the HTTP API must update `openapi/v1.yaml` and the human-readable documentation in the same change set.
