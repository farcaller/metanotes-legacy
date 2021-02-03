--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE Scribbles (
  id TEXT NOT NULL,
  body TEXT NOT NULL,
  props TEXT NOT NULL,
  PRIMARY KEY (id)
);

CREATE VIRTUAL TABLE ScribblesFTS USING fts5 (
  id UNINDEXED,
  body,
  content = 'Scribbles',
  content_rowid = 'rowid'
);

CREATE TRIGGER ScribblesFTSInsert
AFTER INSERT ON Scribbles BEGIN
INSERT INTO
  ScribblesFTS(rowid, body)
VALUES
  (new.rowid, new.body);
END;

CREATE TRIGGER ScribblesFTSDelete
AFTER DELETE ON Scribbles BEGIN
INSERT INTO
  ScribblesFTS(ScribblesFTS, rowid, body)
VALUES
  ('delete', old.rowid, old.body);
END;

CREATE TRIGGER ScribblesFTSUpdate
AFTER UPDATE ON Scribbles BEGIN
INSERT INTO
  ScribblesFTS(ScribblesFTS, rowid, body)
VALUES
  ('delete', old.rowid, old.body);
INSERT INTO
  ScribblesFTS(rowid, body)
VALUES
  (new.rowid, new.body);
END;

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TRIGGER ScribblesFTSInsert;
DROP TRIGGER ScribblesFTSDelete;
DROP TRIGGER ScribblesFTSUpdate;

DROP TABLE ScribblesFTS;

DROP TABLE Scribbles;
