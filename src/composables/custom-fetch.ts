let data: any = {};
let status: number = 400;
let fileName: string = "file_name";

/**
 * This function to handle response from server
 *
 * @param {Headers} headers The fetch headers
 * @param {Response} response The fetch response
 */
async function handleResponse(headers: Headers, response: Response) {
  status = response.status;
  const acceptType = headers.get("Accept");
  const contentType = response.headers.get("Content-Type");
  if (acceptType && acceptType.includes("application/json")) {
    if (!contentType || !contentType.includes("application/json")) {
      throw new TypeError("Oops, we haven't got JSON!");
    }
    data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }
  }
  if (acceptType && acceptType.includes("text/csv")) {
    if (!contentType || !contentType.includes("text/csv")) {
      throw new TypeError("Oops, we haven't got CSV!");
    }
    const disposition = response.headers.get("Content-Disposition");
    if (disposition && disposition.includes("attachment")) {
      fileName = disposition.slice(disposition.indexOf("filename=") + 9);
    }
    data = await response.blob();
    if (!response.ok) {
      throw new Error(await response.text());
    }
  }
}

/**
 * This function is custom get fetch
 *
 * @param {string} uri The fetch uri
 * @returns {Promise<{ data: any; status: number }>} The response type
 */
async function useGetFetch(
  uri: string,
  myHeaders: Headers
): Promise<{ data: any; status: number; fileName: string }> {
  try {
    const response = await fetch(uri, { headers: myHeaders });
    await handleResponse(myHeaders, response);
  } catch (error) {
    console.error(error);
  }
  return { data, status, fileName };
}

/**
 * This function is custom post or patch fetch
 *
 * @param {string} myMethod The fetch method
 * @param {string} uri The fetch uri
 * @param {T} formData The fetch body
 * @param {Headers} myHeaders The fetch headers
 * @returns {Promise<{ data: any; status: number }>} The response from server
 */
async function usePostOrPatchFetch<T>(
  myMethod: string,
  uri: string,
  formData: T,
  myHeaders: Headers
): Promise<{ data: any; status: number }> {
  try {
    const response = await fetch(uri, {
      method: myMethod,
      body: JSON.stringify(formData),
      headers: myHeaders,
    });
    await handleResponse(myHeaders, response);
  } catch (error) {
    console.error(error);
  }
  return { data, status };
}

/**
 * This function is custom delete fetch
 *
 * @param {string} uri The fetch uri
 * @returns {Promise<{ status: number }>} The response type
 */
async function useDeleteFetch(uri: string): Promise<{ status: number }> {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      const response = await fetch(uri, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
      });
      status = response.status;
      if (!response.ok) {
        if (status === 401) {
          localStorage.removeItem("token");
        }
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
