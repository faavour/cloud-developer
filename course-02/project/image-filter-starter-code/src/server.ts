import fs from "fs";
import path from "path";
import express, {Request, Response } from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import { filterImageFromURL, deleteLocalFiles } from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]


  /**************************************************************************** */

  //! END @TODO1

  app.get("/filteredimage", async (req: Request, res: Response) => {
    let image_url = req.query.image_url as string;
    //Validate url
    const isValideUrl = image_url.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);

    if (isValideUrl == null) {
      return res.status(400).send(`Inavlid url! Try again with valid url`);
    }

    let response = await axios({
      method: 'get',
      url: image_url,
      responseType: 'arraybuffer'
    });

    //Process Image
    const filteredImage = await filterImageFromURL(response.data);
    if (filteredImage === undefined || filteredImage === null) {
      return res.status(400).send(`Unable to filter image`);
    }

    res.on('finish', async () => {
      const dir = __dirname + '/util/tmp';
      let files = fs.readdirSync(dir).map((file) => {
        return path.join(dir, file);
      })
      await deleteLocalFiles(files);
    });

    res.status(200).sendFile(filteredImage + '');
  });
  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  });


  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();