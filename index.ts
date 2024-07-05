import app from "./src/app";
import { connectDB } from "./src/db";

const port = process.env.PORT || 3000;

connectDB();

app.listen(port, () => {
	console.log(`[SERVER] Server is running on port: ${port}`);
});
