class FakeCursor:
    def __init__(self, fetchone_results=None, fetchall_results=None):
        self.fetchone_results = list(fetchone_results or [])
        self.fetchall_results = list(fetchall_results or [])
        self.executed = []
        self.rowcount = 1
        self.closed = False

    def execute(self, query, params=()):
        self.executed.append((query, params))

    def fetchone(self):
        if self.fetchone_results:
            return self.fetchone_results.pop(0)
        return None

    def fetchall(self):
        if self.fetchall_results:
            return self.fetchall_results.pop(0)
        return []

    def close(self):
        self.closed = True


class FakeConnection:
    def __init__(self, cursor):
        self._cursor = cursor
        self.committed = False
        self.rolled_back = False
        self.closed = False

    def cursor(self, dictionary=False):
        return self._cursor

    def commit(self):
        self.committed = True

    def rollback(self):
        self.rolled_back = True

    def close(self):
        self.closed = True


class FakeInsertResult:
    def __init__(self, inserted_id='fake-id'):
        self.inserted_id = inserted_id


class FakeUpdateResult:
    def __init__(self, modified_count=0, upserted_id=None):
        self.modified_count = modified_count
        self.upserted_id = upserted_id


class FakeFindResult:
    def __init__(self, items):
        self.items = list(items)

    def sort(self, *_args, **_kwargs):
        return self

    def limit(self, limit):
        return self.items[:limit]


class FakeMongoCollection:
    def __init__(self, items=None):
        self.items = list(items or [])
        self.inserted = []
        self.inserted_many = []
        self.updated = []

    def find(self, filtro=None, projection=None):
        filtro = filtro or {}
        items = [
            item for item in self.items
            if all(item.get(key) == value for key, value in filtro.items())
        ]
        if projection:
            projected = []
            for item in items:
                projected.append({
                    key: value
                    for key, value in item.items()
                    if projection.get(key, 1) != 0
                })
            items = projected
        return FakeFindResult(items)

    def find_one(self, filtro=None, projection=None):
        items = self.find(filtro, projection).limit(1)
        return items[0] if items else None

    def insert_one(self, item):
        self.items.append(item)
        self.inserted.append(item)
        return FakeInsertResult()

    def insert_many(self, items):
        items = list(items)
        self.items.extend(items)
        self.inserted_many.extend(items)

    def update_many(self, filtro, update):
        modified_count = 0
        for item in self.items:
            if all(item.get(key) == value for key, value in filtro.items()):
                item.update(update.get('$set', {}))
                modified_count += 1
        self.updated.append((filtro, update))
        return FakeUpdateResult(modified_count=modified_count)

    def update_one(self, filtro, update, upsert=False):
        existing = self.find_one(filtro)
        if existing:
            existing.update(update.get('$set', {}))
            self.updated.append((filtro, update, upsert))
            return FakeUpdateResult(modified_count=1)

        if upsert:
            novo = {
                **filtro,
                **update.get('$setOnInsert', {}),
                **update.get('$set', {}),
            }
            self.items.append(novo)
            self.updated.append((filtro, update, upsert))
            return FakeUpdateResult(modified_count=0, upserted_id='fake-upsert-id')

        self.updated.append((filtro, update, upsert))
        return FakeUpdateResult(modified_count=0)
