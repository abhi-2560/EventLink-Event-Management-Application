from app.extensions import db


class BaseRepository:
    """Generic CRUD repository."""

    def __init__(self, model):
        self.model = model

    def create(self, **kwargs):
        obj = self.model(**kwargs)
        db.session.add(obj)
        db.session.commit()
        return obj

    def get_by_id(self, obj_id):
        return db.session.get(self.model, obj_id)

    def get_all(self):
        return self.model.query.all()

    def update(self):
        db.session.commit()

    def delete(self, obj):
        db.session.delete(obj)
        db.session.commit()

    def exists(self, obj_id):
        return db.session.get(self.model, obj_id) is not None

    def count(self):
        return self.model.query.count()