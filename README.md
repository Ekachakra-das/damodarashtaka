# Damodarāṣṭakam

A beautiful, responsive Progressive Web App (PWA) edition of the sacred Damodarāṣṭakam prayer with interactive features and clean design.

## ✨ Features

### 📖 Interactive Reading Experience
- **Two Reading Modes**:
  - **Detailed Edition**: Word-by-word Sanskrit breakdown with grammatical analysis
  - **Simple Edition**: Clean Sanskrit text with full English translation only
- **Multi-language Support**: Switch between English and Russian translations
- **Font Size Controls**: Easily adjust text size (A-, A, A+) for comfortable reading
- **Smooth Navigation**: Jump directly to any verse using the hamburger menu

### 🎵 Audio Integration
- **Smart Audio Player**: Plays local audio on mobile, SoundCloud embed on desktop
- **Auto-play**: Starts automatically when activated

### 🖼️ Visual Experience
- **Image Slideshow**: Beautiful Damodara images that rotate automatically (10-second intervals)
- **Click to Advance**: Click anywhere on the slideshow to move to next image
- **Responsive Design**: Optimized for all screen sizes

### 📱 Progressive Web App (PWA)
- **Installable**: Add to home screen on mobile devices
- **Offline Capable**: Service worker for caching and offline functionality
- **Native App Feel**: Fast loading and smooth interactions

### 🎯 User Experience
- **Hamburger Menu**: Clean navigation with verse links, view toggle, and language switch
- **Helpful Tooltips**: Explanatory text for view switching options
- **Smooth Scrolling**: Animated navigation between verses
- **Mobile-First Design**: Touch-friendly interface

## 🚀 Quick Start

### Option 1: Direct Browser Access
1. Open `index.html` in your web browser
2. For best experience, use a modern browser (Chrome, Firefox, Safari, Edge)

### Option 2: Local Development Server
1. Navigate to the project directory
2. Start a local server:
   ```bash
   python3 -m http.server 8000
   ```
   Or use the custom alias:
   ```bash
   startServer
   ```
3. Open `http://localhost:8000` in your browser

## 📁 Project Structure

```
Damodarāṣṭakam/
├── index.html          # Main HTML file
├── style.css           # Styling and responsive design
├── script.js           # Interactive functionality
├── manifest.json       # PWA manifest
├── sw.js              # Service worker for offline functionality
├── verses.html        # Verse content (loaded dynamically)
├── audio/             # Audio files
│   └── damodarashtakam.mp3
├── img/               # Damodara images (1-3)
├── favicon/           # App icons and favicons
└── README.md          # This file
```

## 🎨 Customization

### Font Size
Use the font controls (A-, A, A+) in the interface to adjust text size.

### View Modes
- Click the hamburger menu (☰) to access the view toggle
- Switch between "Detailed Edition" and "Simple Edition" based on your preference
- Your view preference is automatically saved and restored on page reload

### Language
- Use the language toggle in the hamburger menu
- Switch between English and Russian translations
- Your language preference is automatically saved
- Russian version uses optimized fonts for proper Sanskrit diacritics display

### Audio
- Click "Play Damodarashtakam" to start audio playback
- Mobile: Plays local MP3 file
- Desktop: Opens SoundCloud embed

## 🛠️ Development

### Building for Production
The app is ready for production as-is. All assets are optimized and the PWA features work out of the box.

## 📚 Content Source

- **Text**: Damodarāṣṭakam from Padma Purana
- **Translation**: Based on traditional Vaishnava commentaries
- **Reference**: Sri Hari-bhakti-vilasa 2.16.198
- **Source**: Spoken by Sage Satyavrata Muni in conversation with Narada Muni and Saunaka Rishi

## 🙏 Credits

- **Spiritual Content**: Traditional Vedic literature
- **Development**: Ekachakra Das
- **Images**: Damodara deity representations
- **Audio**: Traditional chanting (Aindra Prabhu)
- **Design Inspiration**: Clean, minimal aesthetic for sacred content

## 📄 License

MIT License - Feel free to use, modify, and distribute.

## 🕉️ About Damodarāṣṭakam

The Damodarāṣṭakam is a sacred prayer glorifying Lord Krishna in His Damodara form (with a rope around His waist). This eight-verse prayer is traditionally recited during the month of Kartika and is known for its ability to attract Lord Damodara's mercy.

> "In the month of Kartika one should worship Lord Damodara and daily recite the prayer known as Damodarashtaka, which has been spoken by the sage Satyavrata and which attracts Lord Damodara." - Sri Hari-bhakti-vilasa 2.16.198
