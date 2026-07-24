from app.models import Category
from .base_repository import BaseRepository


class CategoryRepository(BaseRepository):

    def __init__(self):
        super().__init__(Category)

    def get_by_name(self, name):
        return Category.query.filter_by(name=name).first()

    def name_exists(self, name):
        return (
            Category.query.filter_by(name=name).first()
            is not None
        )

    def get_default_category(self):
        return Category.query.filter_by(
            is_default=True
        ).first()

    def get_categories_with_events(self):
        return Category.query.filter(
            Category.total_events > 0
        ).all()

    def search(self, keyword):
        return Category.query.filter(
            Category.name.ilike(f"%{keyword}%")
        ).all()

    def get_by_minimum_events(self, minimum_events):
        return Category.query.filter(
            Category.total_events >= minimum_events
        ).all()

    def get_by_minimum_sales(self, minimum_sales):
        return Category.query.filter(
            Category.total_sales >= minimum_sales
        ).all()