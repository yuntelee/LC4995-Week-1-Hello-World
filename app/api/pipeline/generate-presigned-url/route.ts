import { NextRequest, NextResponse } from "next/server";
import {
  badRequest,
  getAccessToken,
  postToPipeline,
  SUPPORTED_CONTENT_TYPES,
} from "@/app/api/pipeline/_shared";

type RequestBody = {
  contentType?: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as RequestBody | null;
  const contentType = body?.contentType?.toLowerCase();

  if (!contentType || !SUPPORTED_CONTENT_TYPES.has(contentType)) {
    return badRequest("Unsupported or missing image contentType.");
  }

  const { token, response } = await getAccessToken();
  if (!token) {
    return response ?? badRequest("Unauthorized request.");
  }

  const pipelineResponse = await postToPipeline(
    "/pipeline/generate-presigned-url",
    token,
    {
      contentType,
    }
  );

  if (pipelineResponse.response) {
    return pipelineResponse.response;
  }

  return NextResponse.json(pipelineResponse.data);
}
