deno install --allow-scripts
deno task dev


Error will look like this, but will not crash.

```
[1] Block written 11
[1] Block read 11
[0] # 549: PG_RE_THROW(ERROR : 0)
[1] Block read 11
[0] 2025-06-26 21:00:27.429 GMT [0] ERROR:  unnamed prepared statement does not exist
[1] Block read 11
[1] Block read 11
````

Either the write or read thread will die.