type ApiResponse = {
  data: any;
  status: number;
};

let data: any = {};
let status: number = 400;

/**
 * This function to handle request & response type JSON
 *
 * @param {Headers} headers The fetch headers
 * @param {Response} response The fetch response
 */
async function handleJSONResponse(headers: Headers, response: Response) {
  const acceptType = headers.get("Accept");
  if (acceptType && acceptType.includes("application/json")) {
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new TypeError("Oops, we haven't got JSON!");
    }
    data = await response.json();
    status = response.status;
  }
}

/**
 * This function is custom get fetch
 *
 * @param {string} uri The fetch uri
 * @returns {Promise<ApiResponse>} The response from sever
 */
async function useGetFetch(
  uri: string,
  myHeaders: Headers
): Promise<ApiResponse> {
  try {
    const response = await fetch(uri, { headers: myHeaders });
    await handleJSONResponse(myHeaders, response);
    if (!response.ok) {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error(error);
  }
  return { data, status };
}

/**
 * This function is custom post or patch fetch
 *
 * @param {string} method The fetch method
 * @param {string} uri The fetch uri
 * @param {T} formData The fetch body
 * @param {Headers} myHeaders The fetch headers
 * @returns {Promise<ApiResponse>} The response from sever
 */
async function usePostOrPatchFetch<T>(
  method: string,
  uri: string,
  formData: T,
  myHeaders: Headers
): Promise<ApiResponse> {
  try {
    const response = await fetch(uri, {
      method: method,
      body: JSON.stringify(formData),
      headers: myHeaders,
    });
    await handleJSONResponse(myHeaders, response);
    if (!response.ok) {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error(error);
  }
  return { data, status };
}

/**
 * This function is custom delete fetch
 *
 * @param {string} uri The fetch uri
 * @returns {Promise<{ status: number }>} The response from sever
 */
async function useDeleteFetch(uri: string): Promise<{ status: number }> {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      const response = await fetch(uri, {
        method: "DELETE",
        headers: { authorization: `Bearer ${token}` },
      });
      status = response.status;
      if (status === 401) {
        localStorage.removeItem("token");
      }
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
    } else if (uri === "/api/logout") {
      status = 204;
    }
  } catch (error) {
    console.error(error);
  }
  return { status };
}

export { useGetFetch, usePostOrPatchFetch, useDeleteFetch };
