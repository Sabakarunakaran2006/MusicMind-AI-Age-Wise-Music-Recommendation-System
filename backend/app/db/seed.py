import os
import csv
from sqlalchemy.orm import Session
from app.db.session import engine, Base, SessionLocal
from app.models.models import (
    User, UserPreference, AgeGroup, Genre, Song, Playlist, PlaylistSong, Favorite, Feedback
)
from app.core.security import hash_password
from app.core.config import settings

def run_seed():
    print("Creating all database tables...")
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # 1. Seed Age Groups
        print("Checking Age Groups...")
        for ag_data in settings.DEFAULT_AGE_GROUPS:
            existing = db.query(AgeGroup).filter(AgeGroup.name == ag_data["name"]).first()
            if not existing:
                ag = AgeGroup(
                    name=ag_data["name"],
                    min_age=ag_data["min_age"],
                    max_age=ag_data["max_age"],
                    description=ag_data["description"]
                )
                db.add(ag)
        db.commit()

        # 2. Seed Default Genres
        print("Checking Genres...")
        default_genres = [
            ("Pop", "Catchy melodies and upbeat modern production"),
            ("Rock", "Electric guitars, powerful drums, and vocal drive"),
            ("Hip-Hop", "Rhythmic beats, lyrical flow, and urban culture"),
            ("Indie", "Alternative expression, authentic acoustic and electric blend"),
            ("EDM", "Electronic dance anthems, synthesizers, and drops"),
            ("R&B", "Rhythm and blues, smooth soulful vocal styling"),
            ("Classic Rock", "Legendary rock hits from the 60s, 70s, and 80s"),
            ("Jazz", "Improvisation, brass instruments, swing and bebop"),
            ("Classical", "Timeless orchestral masterpieces and piano compositions"),
            ("Folk", "Acoustic storytelling, traditional roots, and harmonies"),
            ("Soul", "Deep emotional vocal delivery and gospel warmth"),
            ("Bollywood", "Melodious Indian film music, emotional strings, and vibrant rhythms"),
            ("Synthwave", "80s retro-futuristic synth arpeggios and neon vibes"),
            ("Acoustic", "Raw acoustic guitars, piano intimacy, and lyrical warmth"),
            ("Lo-Fi", "Mellow chilled beats, vinyl crackle, and relaxing focus vibes"),
            ("Latin", "Energetic Latin rhythms, reggaeton, and tropical beats")
        ]
        for name, desc in default_genres:
            existing = db.query(Genre).filter(Genre.name == name).first()
            if not existing:
                db.add(Genre(name=name, description=desc))
        db.commit()

        # 3. Seed Songs from CSV
        print("Seeding Songs from sample_songs.csv...")
        csv_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "sample_songs.csv")
        csv_path = os.path.abspath(csv_path)

        if os.path.exists(csv_path):
            with open(csv_path, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                count = 0
                for row in reader:
                    existing = db.query(Song).filter(Song.title == row["title"], Song.artist == row["artist"]).first()
                    if not existing:
                        song = Song(
                            title=row["title"],
                            artist=row["artist"],
                            genre=row["genre"],
                            language=row.get("language", "English"),
                            release_year=int(row["release_year"]),
                            tempo=float(row["tempo"]),
                            energy=float(row["energy"]),
                            valence=float(row["valence"]),
                            danceability=float(row["danceability"]),
                            target_age_group=row.get("target_age_group"),
                            cover_image=row.get("cover_image"),
                            audio_url=row.get("audio_url"),
                            external_url=row.get("external_url")
                        )
                        db.add(song)
                        count += 1
                db.commit()
                print(f"Added {count} new songs from dataset.")

        # 4. Seed Demo Users
        print("Checking Demo Users...")
        # Admin User
        admin_email = "admin@musicmind.ai"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                name="Prof. Sarah Vance (Admin)",
                email=admin_email,
                password_hash=hash_password("AdminPassword123!"),
                role="admin",
                age=35,
                is_active=True
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)

            admin_pref = UserPreference(
                user_id=admin.id,
                preferred_language="English",
                mood="Focus",
                listening_purpose="Work/Study",
                explicit_content=False
            )
            admin_pref.preferred_genres = ["Rock", "Classical", "Jazz"]
            db.add(admin_pref)
            db.commit()
            print("Demo Admin created (admin@musicmind.ai / AdminPassword123!)")

        # Listener User
        listener_email = "listener@musicmind.ai"
        listener = db.query(User).filter(User.email == listener_email).first()
        if not listener:
            listener = User(
                name="Alex Morgan",
                email=listener_email,
                password_hash=hash_password("ListenerPassword123!"),
                role="listener",
                age=24,
                is_active=True
            )
            db.add(listener)
            db.commit()
            db.refresh(listener)

            listener_pref = UserPreference(
                user_id=listener.id,
                preferred_language="English",
                mood="Energetic",
                listening_purpose="Daily Drive",
                explicit_content=False
            )
            listener_pref.preferred_genres = ["Synthwave", "Pop", "Indie", "EDM"]
            db.add(listener_pref)
            db.commit()
            print("Demo Listener created (listener@musicmind.ai / ListenerPassword123!)")

            # 5. Seed sample favorites and playlist for listener
            sample_fav_songs = db.query(Song).filter(Song.title.in_([
                "Blinding Lights", "Levitating", "As It Was", "Midnight City"
            ])).all()

            for s in sample_fav_songs:
                db.add(Favorite(user_id=listener.id, song_id=s.id))
                db.add(Feedback(user_id=listener.id, song_id=s.id, rating=5, feedback_type="recommendation_match", comment="Absolute masterpiece, fits my vibe!"))

            # Playlist
            pl = Playlist(
                user_id=listener.id,
                name="Neon Drive & Chill",
                description="Late night synthwave and upbeat pop vibes curated for focus and evening drives",
                is_private=False
            )
            db.add(pl)
            db.commit()
            db.refresh(pl)

            for idx, s in enumerate(sample_fav_songs):
                db.add(PlaylistSong(playlist_id=pl.id, song_id=s.id, position=idx))

            db.commit()
            print("Sample favorites & playlist seeded for Alex.")

        print("Database seed completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
