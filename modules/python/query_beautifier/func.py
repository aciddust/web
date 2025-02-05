import sqlparse

def beautify_query(sql: str) -> str:
    return sqlparse.format(sql, reindent=True, keyword_case='upper')
