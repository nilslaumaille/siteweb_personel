import { createClient } from "tinacms/dist/client";
import { queries } from "./types";
export const client = createClient({ url: 'http://localhost:4001/graphql', token: '6870a6f123723c21ae747bf77837c314fa216871', queries });
export default client;
  