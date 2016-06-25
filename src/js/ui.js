// Access the checkboxes for controlling the list
var listCheckBoxes = $("input[name=menu]");

// Turn off the checkBox for controlling the list
/* Once the window width is above 960 px, the list won't overlap with markers
 * Note that this number depends on the zoom level. If it's large
 * then some markers will be too near to the left edge
 */
/* TODO: if you load in portrait and then flip the ipad to landscape, then
 * the leftmost marker will still be behind the list
 * in iPhone 5, the label would cover an infowindow on the upperleft corner
 */
if (window.innerWidth < 960) {
    listCheckBoxes.prop('checked', false);
}