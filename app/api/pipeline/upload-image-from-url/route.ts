import { NextRequest, NextResponse } from "next/server";
import { badRequest, getAccessToken, postToPipeline } from "@/app/api/pipeline/_shared";

type RequestBody = {
  imageUrl?: string;
  isCommonUse?: boolean;
};

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as RequestBody | null;
  const imageUrl = body?.imageUrl;

  if (!imageUrl) {
    return badRequest("Missing imageUrl.");
  }

  const { token, response } = await getAccessToken();
  if (!token) {
    return response ?? badRequest("Unauthorized request.");
  }

  const pipelineResponse = await postToPipeline(
    "/pipeline/upload-image-from-url",
    token,
    {
      imageUrl,
      isCommonUse: body?.isCommonUse ?? false,
    }
  );

  if (pipelineResponse.response) {
    return pipelineResponse.response;
  }

  return NextResponse.json(pipelineResponse.data);
}
