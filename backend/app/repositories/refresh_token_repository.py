from app.models import RefreshToken
from .base_repository import BaseRepository


class RefreshTokenRepository(BaseRepository):
    def __init__(self):
        super().__init__(RefreshToken)

    def get_by_hash(self, token_hash):
        return RefreshToken.query.filter_by(token_hash=token_hash).first()

    def get_family(self, family_id):
        return RefreshToken.query.filter_by(family_id=family_id).all()
