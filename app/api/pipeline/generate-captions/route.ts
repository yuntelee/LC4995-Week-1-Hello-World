import { NextRequest, NextResponse } from "next/server";
import { badRequest, getAccessToken, postToPipeline } from "@/app/api/pipeline/_shared";

type RequestBody = {
  imageId?: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as RequestBody | null;
  const imageId = body?.imageId;

  if (!imageId) {
    return badRequest("Missing imageId.");
  }

  const { token, response } = await getAccessToken();
  if (!token) {
    return response;
  }

  const pipelineResponse = await postToPipeline(
    "/pipeline/generate-captions",
    token,
    {
      imageId,
    }
  );

  if (pipelineResponse.response) {
    return pipelineResponse.response;
  }

  return NextResponse.json(pipelineResponse.data);
}
