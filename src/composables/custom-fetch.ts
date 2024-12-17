type ApiResponse = {
  data: any;
  status: number;
};

let data: any = {};
let status: number = 400;
let isSuccessful: boolean = false;

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
    const response = await fetch(uri, {
      headers: myHeaders,
    });
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new TypeError("Oops, we haven't got JSON!");
    }
    data = await response.json();
    status = response.status;
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
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new TypeError("Oops, we haven't got JSON!");
    }
    data = await response.json();
    status = response.status;
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
 * @returns {Promise<{ isSuccessful: boolean }>} The response from sever
 */
async function useDeleteFetch(uri: string): Promise<{ isSuccessful: boolean }> {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      const response = await fetch(uri, {
        method: "DELETE",
        headers: { authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      isSuccessful = true;
    } else {
      isSuccessful = true;
    }
  } catch (error) {
    console.error(error);
  }
  return { isSuccessful };
}

export { useGetFetch, usePostOrPatchFetch, useDeleteFetch };
