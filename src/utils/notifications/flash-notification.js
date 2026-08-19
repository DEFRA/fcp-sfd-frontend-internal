/**
 * Creates a flash notification using yar
 * @module flashNotification
 */

/**
 * This function creates a flash notification using yar
 * It uses the title and text provided to create the notification defaulting to Updated and Changes made
 * The HTML field is used if the notification has specific html formatting requirements
 *
 * @param {object} yar - The Hapi `request.yar` session manager
 * @param {string} [title='Updated'] - title for the notification
 * @param {string} [text='Changes made'] - text for the notification
 * @param {string|null} [html=null] - Optional HTML content for the notification
 */
const flashNotification = (yar, title = 'Updated', text = 'Changes made', html = null) => {
  yar.flash('notification', {
    title,
    text,
    html
  })
}

export {
  flashNotification
}
