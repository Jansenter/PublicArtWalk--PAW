# Paw 🎨

NEXT:

Backend (do those count as backend?)

1. Improve the profile functions. After an user build their profile, they should be able to see their profile and login icon on top right. 


2. The artwork display function on the map needs to be updated -- resize the window based on the size of the image. Allow scroll to display multiple photos


3. find a way to legally obtain images of all artworks... can we get them from google map? will that be open sourced images that anyone can use? 


Frontend:

1. circling animation. Make the fonts growing even bigger, touching the edges of the page. , and the paws appear as the dots in the letter of find and it.

#####

### Discover the stories hidden in your city.

Paw is an interactive public art discovery platform that transforms ordinary walks into meaningful cultural experiences. Explore public art around your city, follow curated walking tours based on your interests, and uncover the stories behind each artwork through accessible text and audio descriptions.

Whether you're planning a date, exploring with friends, spending time with family, or visiting a new city, Paw helps you experience your surroundings in a whole new way.

## 🌍 The Problem

Public art is everywhere, yet many people walk past murals, sculptures, and installations without knowing their stories or the artists behind them.

Discovering public art can be difficult because:
- Information about artworks is scattered across different websites and locations.
- Existing maps may show where art is located without making discovery engaging.
- Visitors may not know how to plan a meaningful art-focused walking route.
- People with different accessibility needs may face barriers to engaging with public art.
- Local artists and culturally significant works can go unnoticed.

## 💡 Our Solution

Paw brings public art discovery, guided walking tours, and accessible storytelling into one place.

Users can explore a map of public artworks, choose a tour that matches their interests, and learn about each artwork through written descriptions or audio narration.

Instead of simply showing people where art is, Paw helps them understand and experience it.

## ✨ Key Features

### 🗺️ Interactive Art Map
- Explore public artworks across the city.
- View artwork images, locations, artist information, and descriptions.
- Discover nearby murals, sculptures, installations, and other public art.
- Filter artworks by category or theme.

### 🚶 Personalized Guided Tours
Choose an experience that fits your plans:

- **Date:** Discover scenic artworks and memorable photo spots.
- **Friends:** Explore unusual installations and enjoy interactive challenges.
- **Family:** Follow shorter tours with engaging facts and activities.
- **Tourism:** Discover local landmarks, artists, and cultural stories.
- **Solo Exploration:** Take a self-paced walk and connect with the art around you.

Each tour features an ordered list of artworks, estimated walking time, and a route to guide users between stops.

### 🎧 Accessible Art Stories
Every artwork can tell a story through:
- Written descriptions of the artwork and its background.
- Audio narration for people who prefer listening while exploring.
- Text transcripts so audio content remains accessible.
- Visual descriptions that help users understand an artwork's appearance.

Our goal is to make public art more approachable and inclusive for everyone.

### 🎯 Interactive Art Discovery
Make exploring more engaging with optional activities:
- Look for specific colours, shapes, or materials.
- Answer trivia questions about artworks and artists.
- Complete themed art walks.
- Discover unexpected artworks along the way.

### 🤝 Supporting Local Artists and Communities
Paw helps users discover the people and stories behind public art.

Artwork pages can highlight local artists, cultural context, and links to additional resources. Special care is taken to represent culturally significant works accurately and respectfully.

## ❤️ Social Impact

Paw aims to make culture more accessible, visible, and engaging.

Our intended impact includes:

- **Accessibility:** Offer alternative ways to engage with art through audio, text, and accessible interface design.
- **Cultural education:** Help people learn about the history and cultural significance of public artworks.
- **Artist visibility:** Direct attention toward local artists and works that may be overlooked.
- **Community connection:** Encourage people to explore their neighbourhoods and connect with their surroundings.
- **Inclusive exploration:** Help more people participate in cultural experiences at their own pace.

## 🛠️ Tech Stack

*The technologies below are a proposed starting point and can be updated to reflect the team's implementation.*

- **Frontend:** React, TypeScript, Vite
- **Styling:** CSS or Tailwind CSS
- **Mapping:** Leaflet with OpenStreetMap
- **Artwork Data:** Municipal open-data sources and curated artwork records
- **Audio:** Browser text-to-speech or prerecorded narration
- **Backend:** Node.js and Express, if a backend is needed
- **Data Storage:** JSON for the initial prototype; a database for future expansion

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:

   ```bash
   cd BCS_HACKTHON_2026Oct17
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL displayed in your terminal.

Run these commands from the repository root. `npm install` also installs the app dependencies in `artwalk/`. Node.js only needs to be installed once; rerun `npm install` when setting up a new checkout or when dependencies change.

## 🧭 Example User Journey

1. A user opens Paw and explores the public art map.
2. They select "Date" as their preferred experience.
3. They choose a tour that fits their available time.
4. Paw presents an ordered walking route with several artworks.
5. At each stop, the user opens an artwork page and listens to its story or reads the description.
6. They finish the tour having discovered new artwork, learned about local artists, and experienced their city differently.

## 🗺️ Initial Scope

For the hackathon prototype, we aim to build:

- An interactive map featuring a curated collection of public artworks in one neighbourhood.
- Artwork detail pages with images and descriptions.
- A small selection of themed walking tours.
- An ordered tour experience with estimated walking time.
- Audio narration or text-to-speech for artwork descriptions.
- A simple, intuitive interface designed for accessibility.

Future versions could include user-created tours, more cities, verified accessibility information, community contributions, and more advanced route personalization.

## 🔮 Future Possibilities

- AI-assisted tour recommendations grounded in verified artwork data.
- Tours based on available time, walking distance, and personal interests.
- Community-submitted artwork recommendations with moderation.
- Artist interviews and audio storytelling.
- Multilingual descriptions and narration.
- Wheelchair-accessible route planning using verified accessibility data.
- Progress tracking and themed art challenges.

## 👥 Who Is Paw For?

Paw is for curious locals, tourists, families, friends, couples, solo explorers, and anyone who wants to engage more deeply with public art.

No art expertise required. Just a willingness to explore.

## 🌱 Our Vision

We believe art should be accessible beyond museums and galleries.

By connecting people with the artworks, artists, and stories that surround them, Paw aims to make cities more engaging, inclusive, and culturally connected—one walk at a time.

---

**Built with curiosity and a love for art. 🎨**


