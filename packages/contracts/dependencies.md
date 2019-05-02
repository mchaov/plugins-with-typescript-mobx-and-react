Build/Test/Lint are excluded as they do not affect the architecture.

Note that the contracts package can be distributed as TS.

Note that contracts may include interfaces from other libraries and re-export them so that your other packages may use DI to get what they need.

```json
{
  "dependencies": {}
}
```