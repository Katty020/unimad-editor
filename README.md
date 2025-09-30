# BlockNote Portfolio Editor

A sophisticated portfolio editor built with Next.js and BlockNote that allows you to create and manage project cards with nested rich-text editing capabilities.

## 🚀 Features

- **Rich Text Editing**: Powered by BlockNote for advanced text editing with markdown support
- **Custom Project Cards**: Create nested project cards with their own rich-text editors
- **Auto-Save**: Automatic saving every 30 seconds with manual save options
- **Import/Export**: Export your portfolio as JSON and import existing content
- **Responsive Design**: Beautiful, mobile-friendly interface built with Tailwind CSS
- **Local Storage**: Persistent storage in browser with API backup
- **Real-time Updates**: Live preview of changes with unsaved changes indicator

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (Pages Router)
- **Editor**: BlockNote (Rich text editor)
- **Styling**: Tailwind CSS
- **UI Components**: Mantine Core
- **Icons**: Lucide React, React Icons, Tabler Icons
- **Language**: TypeScript
- **State Management**: React Hooks + Local Storage

## 📁 Project Structure

```
src/
├── components/
│   ├── BlockNoteEditor.tsx    # Main editor component with custom blocks
│   ├── ProjectCard.tsx        # Project card display component
│   └── ProjectModal.tsx       # Modal for editing individual projects
├── hooks/
│   └── useLocalStorage.ts     # Custom hook for localStorage management
├── types/
│   └── index.ts              # TypeScript type definitions
└── index.css                 # Global styles with Tailwind

pages/
├── _app.tsx                  # Next.js app wrapper with Mantine provider
├── index.tsx                 # Main page with dynamic editor loading
└── api/
    └── save-content.ts       # API endpoint for saving content

```

## 🔧 How It Works

### 1. Main Editor (`BlockNoteEditor.tsx`)

The core component that orchestrates the entire editing experience:

- **Custom Block Creation**: Defines a custom "ProjectCard" block type using BlockNote's `createReactBlockSpec`
- **Slash Menu Integration**: Adds `/project card` command to insert new project cards
- **Content Management**: Handles saving, loading, importing, and exporting of content
- **Auto-save Logic**: Implements automatic saving every 30 seconds when changes are detected

```typescript
// Custom block definition
const ProjectCardBlock = createReactBlockSpec({
  type: "projectCard",
  propSchema: {
    id: { default: "" },
    title: { default: "New Project" },
    editorContent: { default: "[]" },
    // ... other properties
  },
  content: "none",
});
```

### 2. Project Cards (`ProjectCard.tsx`)

Individual project card components that display project information:

- **Preview Display**: Shows project title, preview image, and metadata
- **Click to Edit**: Opens modal editor when clicked
- **Visual Feedback**: Hover effects and status indicators
- **Date Formatting**: Human-readable creation and update dates

### 3. Project Modal (`ProjectModal.tsx`)

Full-screen modal for editing individual projects:

- **Nested Editor**: Each project has its own BlockNote editor instance
- **Title Editing**: Inline title editing with auto-save
- **Change Detection**: Tracks unsaved changes and warns before closing
- **Keyboard Shortcuts**: Supports Cmd+S to save, Esc to close
- **Image Preview**: Automatically extracts first image as project preview

### 4. Data Flow

```
User Input → BlockNote Editor → Project Card → Project Modal → Nested Editor
     ↓                                                              ↓
Local Storage ← API Endpoint ← Content Serialization ← Change Detection
```

### 5. Storage System

**Local Storage**: Primary storage for immediate persistence
```typescript
const [savedContent, setSavedContent] = useLocalStorage('blocknote-portfolio-content', null);
```

**API Backup**: Server-side storage via `/api/save-content.ts`
- Maintains in-memory store (replace with database in production)
- Supports both GET and POST operations
- Provides content versioning with timestamps

### 6. Content Structure

```typescript
interface EditorContent {
  blocks: any[];              // BlockNote document blocks
  projectCards: Record<string, ProjectCardData>; // Project card data
}

interface ProjectCardData {
  id: string;
  title: string;
  content: any[];            // Nested editor content
  previewImage?: string;     // Auto-extracted from content
  createdAt: string;
  updatedAt: string;
}
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd blocknote-portfolio-editor
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:3000
```

### Usage

1. **Create Content**: Start typing in the main editor
2. **Add Project Card**: Type `/project card` and press Enter
3. **Edit Projects**: Click on any project card to open the detailed editor
4. **Save Work**: Use Cmd+S or the Save button (auto-saves every 30 seconds)
5. **Export/Import**: Use the header buttons to backup or restore content

## 🎨 Customization

### Adding New Block Types

1. Define the block spec in `BlockNoteEditor.tsx`:
```typescript
const CustomBlock = createReactBlockSpec({
  type: "customBlock",
  propSchema: { /* properties */ },
  content: "none",
}, {
  render: (props) => <CustomComponent {...props} />
});
```

2. Add to editor configuration:
```typescript
const editor = useCreateBlockNote({
  blockSpecs: {
    projectCard: ProjectCardBlock,
    customBlock: CustomBlock, // Add here
  }
});
```

### Styling

- **Global Styles**: Modify `src/index.css`
- **Component Styles**: Use Tailwind classes in components
- **Theme**: Customize Mantine theme in `_app.tsx`

## 🔒 Security Considerations

- **Input Sanitization**: BlockNote handles content sanitization
- **XSS Protection**: React's built-in XSS protection
- **API Validation**: Server-side content validation in API routes

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

Create `.env.local` for production:
```
NEXT_PUBLIC_API_URL=your-api-url
DATABASE_URL=your-database-url
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Common Issues

**"Cannot read properties of undefined (reading 'schema')"**
- This occurs when BlockNote runs on the server-side
- Solution: The editor is dynamically imported with `ssr: false`

**Dependencies not installing**
- Clear node_modules and package-lock.json
- Run `npm install --legacy-peer-deps`

**Editor not loading**
- Check browser console for errors
- Ensure all BlockNote dependencies are properly installed

## 📚 Additional Resources

- [BlockNote Documentation](https://www.blocknotejs.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Mantine Documentation](https://mantine.dev/)
