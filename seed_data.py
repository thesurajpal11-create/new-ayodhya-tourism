# Sample data to populate the database
# Run this after creating the tables

from database import SessionLocal
from app.models.destination import Destination

db = SessionLocal()

# Create destinations
destinations = [
    {
        "name": "Ayodhya",
        "description": "Ayodhya is one of the most sacred cities in Hindu tradition. It is believed to be the birthplace of Lord Ram. The city is home to the magnificent Ram Mandir, one of the largest temples in India. The spiritual and cultural significance of Ayodhya makes it a must-visit destination for pilgrims and tourists.",
        "short_description": "Holy birthplace of Lord Ram with the magnificent Ram Mandir",
        "image_url": "/images/ayodhya.jpg",
        "best_time_to_visit": "October to March"
    },
    {
        "name": "Varanasi",
        "description": "Varanasi, also known as Kashi, is one of the oldest continuously inhabited cities in the world. Situated on the banks of the Holy Ganges River, Varanasi is the spiritual capital of India. The city is famous for its sacred ghats where devotees perform rituals. The Ganges Aarti at Dashashwamedh Ghat is a mesmerizing spiritual experience.",
        "short_description": "Spiritual heart of India with sacred Ganges Ghats",
        "image_url": "/images/varanasi.jpg",
        "best_time_to_visit": "October to December"
    },
    {
        "name": "Chitrakoot",
        "description": "Chitrakoot is a place of immense religious significance, believed to be where Lord Ram spent his exile. Located on the banks of the Mandakini River, Chitrakoot is home to several important temples. The place offers a blend of spirituality and natural beauty with scenic hills and forests.",
        "short_description": "Lord Ram's retreat place with sacred temples and natural beauty",
        "image_url": "/images/chitrakoot.jpg",
        "best_time_to_visit": "October to March"
    },
    {
        "name": "Mathura",
        "description": "Mathura is the birthplace of Lord Krishna and one of the most important pilgrimage centers in India. The city is filled with temples and religious sites dedicated to Krishna. Krishna Janmabhoomi Temple is the most sacred site here. The city is also known for its vibrant culture and traditional crafts.",
        "short_description": "Sacred birthplace of Lord Krishna with ancient temples",
        "image_url": "/images/mathura.jpg",
        "best_time_to_visit": "November to February"
    },
    {
        "name": "Gaya",
        "description": "Gaya is a major pilgrimage destination for Hindus, Buddhists, and Jains. It is famous for the Vishnupad Temple, one of the most sacred temples dedicated to Lord Vishnu. Gaya is believed to be the place where Buddha attained enlightenment. The city has deep spiritual significance and attracts thousands of pilgrims annually.",
        "short_description": "Sacred pilgrimage site with Vishnupad Temple and spiritual significance",
        "image_url": "/images/gaya.jpg",
        "best_time_to_visit": "October to March"
    },
    {
        "name": "Kashi",
        "description": "Kashi is the ancient holy city on the banks of the Ganges, famous for evening aarti and spiritual rituals.",
        "short_description": "Ancient holy city with the timeless Ganges aarti.",
        "image_url": "https://content.skyscnr.com/m/26eaa06a2be696f0/original/GettyImages-525109131.jpg",
        "best_time_to_visit": "October to December"
    },
    {
        "name": "Vrindavan",
        "description": "Vrindavan is a divine town dedicated to Lord Krishna, known for its temples and sacred gardens.",
        "short_description": "Divine Krishna town with temples and spiritual gardens.",
        "image_url": "https://www.makemytrip.com/tripideas/places/vrindavan",
        "best_time_to_visit": "November to February"
    },
    {
        "name": "Vidhyachal",
        "description": "Vidhyachal is a historic spiritual retreat with ancient temples and scenic hills.",
        "short_description": "Historic spiritual retreat with temples and panoramic views.",
        "image_url": "https://www.captureatrip.com/blog/vindhyachal-temple",
        "best_time_to_visit": "October to March"
    },
    {
        "name": "Namshsiaryan",
        "description": "Namshsiaryan is a sacred pilgrimage spot known for its spiritual heritage and peaceful atmosphere.",
        "short_description": "A sacred pilgrimage site with rich cultural traditions.",
        "image_url": "/images/tree-place.svg",
        "best_time_to_visit": "October to March"
    }
]

for dest in destinations:
    new_dest = Destination(**dest)
    db.add(new_dest)

db.commit()
print("Sample destinations added successfully!")
