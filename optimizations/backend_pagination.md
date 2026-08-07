# Backend Pagination Implementation Guide

This document explains how backend pagination should be implemented in a production-ready Flask application.

---

# Why Pagination?

Without pagination, every request returns all records.

Example:

```http
GET /events
```

If there are 100,000 events, the backend would:

- Read all rows
- Serialize all rows
- Send a huge response
- Increase database load
- Increase response time
- Increase memory usage

Pagination limits the number of records returned per request.

---

# API Design

Use query parameters.

Example:

```http
GET /events?page=1&page_size=20
```

Another example:

```http
GET /admin/audit-logs?page=3&page_size=50
```

---

# Standard Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | Integer | 1 | Current page number |
| page_size | Integer | 20 | Records per page |

Always validate:

- page >= 1
- page_size >= 1
- page_size <= MAX_PAGE_SIZE

Example:

```python
MAX_PAGE_SIZE = 100
```

---

# Service Layer

Read pagination parameters.

Example:

```python
page = max(request.args.get("page", 1, type=int), 1)
page_size = request.args.get("page_size", 20, type=int)
page_size = min(max(page_size, 1), 100)
```

---

# Database Query

Use SQLAlchemy pagination.

Example:

```python
query = Event.query.filter(...)
```

Then:

```python
pagination = query.paginate(
    page=page,
    per_page=page_size,
    error_out=False,
)
```

---

# Response Format

Always return metadata.

Example:

```json
{
  "items": [
    ...
  ],
  "page": 1,
  "page_size": 20,
  "total": 157,
  "total_pages": 8
}
```

---

# Calculating Total Pages

Formula:

```text
total_pages = ceil(total / page_size)
```

SQLAlchemy's Pagination object already provides this.

---

# Standard Helper Function

Instead of repeating pagination logic in every service, create a helper.

Example:

```python
def paginate(query, page, page_size):
    pagination = query.paginate(
        page=page,
        per_page=page_size,
        error_out=False,
    )

    return {
        "items": pagination.items,
        "page": pagination.page,
        "page_size": pagination.per_page,
        "total": pagination.total,
        "total_pages": pagination.pages,
    }
```

Now every service becomes:

```python
return paginate(query, page, page_size)
```

---

# Pagination Metadata

Always include:

```json
{
    "page": 2,
    "page_size": 20,
    "total": 198,
    "total_pages": 10
}
```

Avoid returning only the items.

---

# Ordering

Pagination must always use a deterministic ordering.

Good:

```python
query.order_by(Event.created_at.desc())
```

Bad:

```python
query.all()
```

Without ordering, records may appear on multiple pages or disappear between requests.

---

# Combining with Filters

Filtering should happen before pagination.

Correct:

```python
query = Event.query

query = query.filter(...)

query = query.order_by(...)

pagination = query.paginate(...)
```

Never paginate first and then filter.

---

# Combining with Search

Example:

```http
GET /events?keyword=AI&page=2&page_size=20
```

Flow:

```
Search
      ↓
Apply Filters
      ↓
Sort
      ↓
Paginate
      ↓
Return Response
```

---

# Combining with Sorting

Example:

```http
GET /events?sort=created_at&order=desc&page=1&page_size=20
```

Flow:

```
Search
      ↓
Filter
      ↓
Sort
      ↓
Pagination
```

---

# Frontend Flow

Frontend requests:

```http
GET /events?page=1&page_size=20
```

Backend returns:

```json
{
  "items": [...],
  "page": 1,
  "page_size": 20,
  "total": 412,
  "total_pages": 21
}
```

Frontend renders:

```
Previous

1 2 3 4 5

Next
```

---

# Performance Considerations

## Use LIMIT/OFFSET

Pagination should generate SQL similar to:

```sql
SELECT *
FROM event
ORDER BY created_at DESC
LIMIT 20
OFFSET 40;
```

Never fetch every row into memory.

---

# Maximum Page Size

Never allow unlimited page sizes.

Good:

```python
MAX_PAGE_SIZE = 100
```

If client requests:

```http
page_size=5000
```

Return:

```python
page_size = 100
```

---

# Index Frequently Queried Columns

Pagination works best when ordering/filtering columns are indexed.

Examples:

- created_at
- status
- category_id
- organizer_id
- city

---

# Consistent Response Structure

Use the same pagination structure for every list endpoint.

Example:

```json
{
  "items": [],
  "page": 1,
  "page_size": 20,
  "total": 0,
  "total_pages": 0
}
```

---

# Production Checklist

- Query parameters for page and page_size
- Input validation
- Maximum page size enforced
- Filters applied before pagination
- Search applied before pagination
- Sorting applied before pagination
- Deterministic ordering
- SQL LIMIT/OFFSET used
- Standard response format
- Pagination helper reused across services
- Indexed ordering/filtering columns
- No in-memory pagination
- Consistent API contract across all endpoints