# Minecraft Stats Documentation

Public documentation and API contract for the Minecraft Stats Platform.

## Documentation responsibilities

This repository is the cross-project source of truth for:

- architecture
- self-hosting
- client configuration
- API documentation
- security model
- privacy
- development workflow
- compatibility
- OpenAPI

## Structure

```
docs/
├── introduction/
├── client/
├── server/
├── dashboard/
├── self-hosting/
├── security/
└── development/

openapi/
└── v1.yaml
```

## Source of truth

Cross-repository interfaces must be documented here before implementation changes are merged:

- API endpoints
- authentication schemes
- scopes
- request/response schemas
- protocol version
- client configuration

## License

MIT.