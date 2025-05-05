# Browser Usage Report Chrome Extension

## Description

This Chrome extension tracks the websites you visit and provides a simple dashboard to visualize your browsing habits. It counts how many times each website (domain) is opened and allows you to view statistics categorized by different time periods.

## Features

*   **Website Visit Tracking:** Automatically records the domain name and timestamp every time a tab finishes loading a website (HTTP/HTTPS).
*   **Statistics Dashboard:** Accessible via the extension popup.
*   **Time Period Filtering:** View statistics for:
    *   Overall (all recorded data)
    *   Current Month
    *   Current Week
    *   Today
*   **Domain Filtering:** Search for specific domains within the selected time period.
*   **Percentage View:** Shows the visit count and the percentage of total visits for each domain within the selected time period and filter.
*   **Data Clearing:** Option to clear all tracked browsing data.
*   **Debounced Saving:** Efficiently saves data to local storage to minimize performance impact.

## How to Install/Load (for Development)

1.  Clone or download this repository/folder (`browser-report`).
2.  Open Google Chrome.
3.  Navigate to `chrome://extensions/`.
4.  Enable **Developer mode** (usually a toggle switch in the top-right corner).
5.  Click the **Load unpacked** button.
6.  Select the `browser-report` folder containing the `manifest.json` file.
7.  The extension icon should appear in your Chrome toolbar.

## How to Use

1.  Browse the web as usual. The extension will track visits in the background.
2.  Click the extension icon in your Chrome toolbar to open the popup dashboard.
3.  Use the **Time Period** dropdown to select the desired time frame (Overall, Monthly, Weekly, Daily).
4.  Use the **Filter by Domain** input field to search for specific websites. The list will update as you type (with a slight delay).
5.  The list displays the domain, the number of visits, and the percentage of total visits for the selected period/filter.
6.  Click the **Clear All Data** button to remove all stored visit history (a confirmation prompt will appear).

## Folder Structure

```
.
├── background.js       # Handles background event listening (tab updates) and data storage
├── manifest.json       # Extension configuration file
├── popup.html          # HTML structure for the extension popup
├── popup.css           # CSS styling for the popup
├── popup.js            # JavaScript logic for the popup (displaying stats, filtering)
├── icons/              # Folder containing extension icons (16x16, 48x48, 128x128)
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md           # This file
```

## Potential Future Improvements

*   Add charts/visualizations for the statistics.
*   Allow exporting the data (e.g., to CSV).
*   Track time spent on each site, not just visit count.
*   Add options for excluding specific domains from tracking.
*   Implement data synchronization across devices (requires different permissions/storage).
*   Add favicons next to domain names in the list.
