import type { PlasmoMessaging } from "@plasmohq/messaging";

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const response = await fetch(
    `${process.env.PLASMO_PUBLIC_API_URL}/lowest?url=${encodeURIComponent(req.body.url)}`,
  );
  const { lowest } = await response.json();
  res.send({ lowest });
};

export default handler;
