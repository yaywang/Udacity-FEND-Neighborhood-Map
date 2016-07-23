// Access the checkboxes for controlling the menu
var menuCheckBoxes = $("input[name=menu]");

// Turn off the checkBox for controlling the menu
/* Once the window width is above 960 px, the menu won't overlap with markers
 * Note that this number depends on the zoom level. If it's large
 * then some markers will be too near to the left edge
 */
/* TODO: if you load in portrait and then flip the ipad to landscape, then
 * the leftmost marker will still be behind the menu
 * in iPhone 5, the label would cover an infowindow on the upperleft corner
 */
if (window.innerWidth < 960) {
    menuCheckBoxes.prop('checked', false);
} else {
	menuCheckBoxes.prop('checked', true);
}