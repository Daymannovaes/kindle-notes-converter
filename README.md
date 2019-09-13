- Go to your Kindle mobile version > open the book > see notes > share > export
- Export as any html version

- move the file to this project folder
- run `node converter.js input.html output.json`

- Close your Kindle application
- go to `/Users/YOUR_USERNAME/Library/Application Support/Kindle/My Kindle Content`
- find the file `NAME_OF_BOOK.mpb` and open it
- paste the `output.json` content inside the `records` array property
- Open your Kindle application
