# 📚 Book Explorer

A modern, responsive web application for browsing, searching, and exploring books using the Open Library API. Built with React, TypeScript, and Redux Toolkit, featuring real-time notifications, favorites management, and a beautiful dark/light theme.

**🌐 Live Demo**: [https://lockop.github.io/book-explorer/](https://lockop.github.io/book-explorer/)

**👨‍💻 Author**: Arul Madhava - [madhavaarul@gmail.com](mailto:madhavaarul@gmail.com)

![Book Explorer Screenshot](./public/screenshot.png)

---

## ✅ Assignment Requirements  

- ✅ **Fetch book data** from the Open Library API  
- ✅ **Display books in grid/list** with title, author, cover image, and publish year  
- ✅ **Search bar** to filter by title or author (with debounce optimization)  
- ✅ **Sorting** by publish year and title  
  - ⚠️ *Assumption*: Open Library only supports limited sort keys → implemented **Popular, Title, Newest, Oldest, Random**  
- ✅ **Book detail view** in a modal with link to Open Library page  
- ✅ **Notifications** for user events (favorites added, search, sort, view and theme change, some books added and updated)  
- ✅ **Long-polling mechanism**  
  - ⚠️ *Trade-off*: Open Library doesn’t support long polling → implemented **simple polling every 10s** using Recent Changes API  
- ✅ **Favorites list** stored locally with persistence  
- ✅ **Infinite scrolling** for book results (instead of pagination)  
- ✅ **Responsive design** with mobile-first layout  
- ✅ **Dark/Light theme toggle**  

---

## 🎁 Additional Features  

- 🎨 **Custom theming** shadcn/ui based + Tailwind  
- 🔄 **Cross-tab synchronization** for favorites & notifications via localStorage  
- 🔗 **URL-based state** for search, sort, and view mode (shareable/bookmarkable links)  
- 🖼️ **Image loader & placeholder** for broken/missing covers  
- ⏳ **Debounced search input** (500ms) for better performance  
- 💾 **Persistent storage strategy** with cleanup rules for notifications  
- 🔔 **Dual notifications system**:  
  - **Sonner (toast)** → quick, auto-dismiss alerts  
  - **Sidebar list** → persistent history with read/unread status and clear actions  

---

## 💭 Thought Process

I decided to build the application using a **React + TypeScript** setup bundled with **Webpack**, styled with **Tailwind CSS** for utility-first design, and managed global state with **Redux Toolkit**.  

This ensures:
- ✅ Type safety  
- ✅ Predictable state handling  
- ✅ Rapid UI development with reusable components  

For backend data, I explored the **Open Library API** and focused on three main endpoints:  
- **🔍 Search API** → Fetch book lists with search, sorting, pagination, filtering  
- **📚 Work & Edition APIs** → Fetch detailed book information when a user selects one  
- **🔄 Recent Changes API** → Enable a simple polling mechanism to fetch updates and trigger notifications  

### 🏗️ UI Structure

- **📋 Header**  
  - Theme toggle (light/dark)  
  - Notification sidebar trigger  
  - Favorites sidebar trigger  

- **🔍 Subheader (Search Controls)**  
  - Search input with debounce  
  - Sort dropdown (API-supported options)  
  - View type toggle (grid/list, auto-switches to list on mobile)  

- **📖 Body**  
  - Book results as cards (grid or list)  
  - Infinite scrolling for pagination  
  - Modal with book details + redirect to Open Library  

---

## 🎨 Design Decisions

### 🎯 UI Framework & Theming
- Followed **shadcn/ui** approach for consistency
- Light/dark themes implemented with minimal effort

### 📱 Responsive Layout
- Used **Tailwind CSS breakpoints** for adaptive design
- UI auto-adjusts for desktop, tablet, and mobile

### ⏳ Image Loading & Error States
- **Skeleton loaders** while fetching book covers
- **Fallback placeholder** for missing covers

### 📑 Sidebars
- **❤️ Favorites Sidebar** → Locally saved books
- **🔔 Notifications Sidebar** → Persistent list of fetched notifications

### 🔔 Notifications UX
- **📋 Sidebar list** → Persistent notification history
- **🍞 Toast popups** → Transient 3-second real-time alerts

---

## ⚡ Challenges & Solutions

### 1. 🔄 Long Polling vs Simple Polling  
**Challenge**: Assignment required long polling, but Open Library API doesn't support it.  
**Solution**: Implemented **simple polling every 10s** using the Recent Changes API. Triggered toast + sidebar notifications when updates were detected.  

### 2. 📊 Sorting Options Mismatch  
**Challenge**: API didn't provide the exact asc/desc sort keys required.  
**Solution**: Limited sorting to API-supported keys (Popular, Title, Newest, Oldest, Random).  

### 3. 🔗 URL-State Synchronization  
**Challenge**: Keeping Redux state in sync with URL parameters.  
**Solution**: Built a custom `useUrlState` hook to parse/update URL params and sync with Redux.  

### 4. 🔄 Cross-Tab Data Mismatch  
**Challenge**: Favorites/notifications inconsistent across tabs.  
**Solution**: Synced Redux actions with **localStorage** in near real-time to ensure cross-tab consistency.  

---

## 🛠️ Running the Application Locally

### 📋 Prerequisites
- Node.js (v16 or higher)  
- npm  

### 🚀 Installation
```bash
# Clone repo
git clone https://github.com/LockOP/book-explorer.git
cd book-explorer

# Install dependencies
npm install
```

### 🔧 Development
```bash
npm run dev
```
- Starts local dev server with hot reload at [http://localhost:3000](http://localhost:3000)

### 🏗️ Production (Local Build)
```bash
npm run build:local   # Build optimized production files
npm run serve:local   # Serve locally using npx serve dist
```

---

## ⚖️ Trade-offs & Assumptions

### 1. 🔄 Polling vs Long Polling  
- **Trade-off**: Used simple polling (every 10s) instead of unsupported long polling
- **Assumption**: 10s interval provides sufficient "real-time" effect without hitting rate limits

### 2. 📊 Sorting Options  
- **Trade-off**: Couldn't fully support asc/desc on all fields
- **Assumption**: Limited to 5 intuitive options (Popular, Title, Newest, Oldest, Random)

### 3. 🔔 Notifications  
- **Trade-off**: Didn't compare latest book IDs, just notified user of "new updates"
- **Assumption**: Users prefer high-level updates vs granular book-by-book diffs
- **Notifications config**:  
  - **3s toast cooldown**  
  - **7-day retention / 25 items max**  
  - Dual delivery (toast + sidebar)

### 4. ⚙️ API Config & Defaults  
- **Timeout**: 10s API timeout per request
- **Search defaults**: 20 results, offset=0, 500ms debounce
- **View defaults**: Grid view, auto-switch to list <768px
- **Theme default**: Light mode with toggle

---

**👨‍💻 Author**: Arul Madhava - [madhavaarul@gmail.com](mailto:madhavaarul@gmail.com)  
Built with ❤️ using React, TypeScript, and Tailwind CSS
