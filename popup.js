// popup.js

document.addEventListener('DOMContentLoaded', () => {
  const timePeriodSelect = document.getElementById('timePeriod');
  const domainFilterInput = document.getElementById('domainFilter');
  const statsList = document.getElementById('statsList');
  const loadingIndicator = document.getElementById('loadingIndicator'); 
  const clearDataButton = document.getElementById('clearDataButton');

  // --- Function to show/hide loading indicator ---
  function showLoading(isLoading) {
      if (isLoading) {
          statsList.innerHTML = ''; // Clear list while loading
          loadingIndicator.classList.add('visible');
      } else {
          loadingIndicator.classList.remove('visible');
      }
  }

  // Function to filter and display stats
  function displayStats() {
    const selectedPeriod = timePeriodSelect.value;
    const domainFilter = domainFilterInput.value.toLowerCase().trim();

    showLoading(true); // Now this should work

    // Use setTimeout to ensure loading shows
    setTimeout(() => {
        chrome.storage.local.get(['sites'], (result) => {
          // Ensure loading is hidden even if there's an error
          if (chrome.runtime.lastError) {
            showLoading(false); 
            console.error("Error retrieving site data:", chrome.runtime.lastError);
            statsList.innerHTML = '<li>Error loading statistics. Please try again.</li>';
            return; 
          }
          
          const sites = result.sites || {};
          const now = new Date();

          // --- Calculate visits per site within the selected time period --- 
          let sitesInPeriod = Object.entries(sites).map(([domain, data]) => {
            let visitsInPeriod = data.visits.filter(timestamp => {
              const visitDate = new Date(timestamp);
              switch (selectedPeriod) {
                case 'daily':
                  return visitDate.toDateString() === now.toDateString();
                case 'weekly':
                  const startOfWeek = new Date(now);
                  startOfWeek.setDate(now.getDate() - now.getDay());
                  startOfWeek.setHours(0, 0, 0, 0);
                  const endOfWeek = new Date(startOfWeek);
                  endOfWeek.setDate(startOfWeek.getDate() + 7);
                  return visitDate >= startOfWeek && visitDate < endOfWeek;
                case 'monthly':
                  return visitDate.getFullYear() === now.getFullYear() && visitDate.getMonth() === now.getMonth();
                case 'overall':
                default:
                  return true;
              }
            });
            return {
              domain,
              // Calculate count directly from the filtered visits array length
              count: visitsInPeriod.length 
            };
          }).filter(site => site.count > 0); // Filter out sites with 0 visits in the period

          // --- Calculate total visits for percentage calculation --- 
          // This calculation remains correct as it sums the derived counts
          const totalVisitsInPeriod = sitesInPeriod.reduce((sum, site) => sum + site.count, 0);

          // --- Apply domain filter --- 
          let filteredSites = sitesInPeriod;
          if (domainFilter) {
            filteredSites = sitesInPeriod.filter(site => site.domain.toLowerCase().includes(domainFilter));
          }

          // Sort by count descending
          filteredSites.sort((a, b) => b.count - a.count);

          // --- Display the results --- 
          showLoading(false); // Hide loading indicator before showing results
          statsList.innerHTML = ''; // Clear list

          // --- Corrected Empty State Handling ---
          if (sitesInPeriod.length === 0) {
              // Case 1: No visits recorded for the selected time period at all
              statsList.innerHTML = '<li>No visits recorded for this time period.</li>';
          } else if (filteredSites.length === 0) {
              // Case 2: Visits exist for the period, but none match the domain filter
              statsList.innerHTML = '<li>No sites match the domain filter for this period.</li>';
          } else {
              // Case 3: Display the filtered sites
              filteredSites.forEach(site => {
                const listItem = document.createElement('li');
                const domainSpan = document.createElement('span');
                domainSpan.textContent = site.domain;
                
                const percentageSpan = document.createElement('span');
                let percentage = 0;
                // Ensure totalVisitsInPeriod is used for percentage calculation
                if (totalVisitsInPeriod > 0) { 
                    percentage = ((site.count / totalVisitsInPeriod) * 100).toFixed(1);
                }
                // Display count and percentage
                percentageSpan.textContent = `${site.count} (${percentage}%)`; 

                listItem.appendChild(domainSpan);
                listItem.appendChild(percentageSpan);
                statsList.appendChild(listItem);
              });
          }
          // --- End Corrected Empty State Handling ---

        });
    }, 50); // Small delay

  }

  // --- Clear All Data function ---
  function clearAllData() {
      if (confirm("Are you sure you want to clear all browsing data tracked by this extension? This cannot be undone.")) {
          chrome.storage.local.set({ sites: {} }, () => {
              if (chrome.runtime.lastError) {
                  console.error("Error clearing site data:", chrome.runtime.lastError);
                  alert("Error clearing data. Please try again.");
              } else {
                  console.log("All site data cleared.");
                  displayStats(); // Refresh the view to show it's empty
              }
          });
      }
  }

  // Debounce function to limit how often displayStats is called
  function debounce(func, delay) {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
    };
  }

  const debouncedDisplayStats = debounce(displayStats, 300);

  // Initial display
  displayStats();

  // Add event listeners for filters
  timePeriodSelect.addEventListener('change', displayStats);
  domainFilterInput.addEventListener('input', debouncedDisplayStats);
  clearDataButton.addEventListener('click', clearAllData);
});
