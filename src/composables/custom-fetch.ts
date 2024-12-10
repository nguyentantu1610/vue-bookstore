type ApiResponse = {
  data: any;
  status: number;
};

/**
 * This function is custom post fetch
 *
 * @param {string} uri The fetch uri
 * @param {T} formData The fetch body
 * @returns {Promise<ApiResponse>} The response from sever
 */
async function usePostFetch<T>(uri: string, formData: T): Promise<ApiResponse> {
  let data: any = {};
  let status: number = 400;
  try {
    const response = await fetch(uri, {
      method: "POST",
      body: JSON.stringify(formData),
      headers: { Accept: "application/json" },
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
 * @returns {Promise<{ isDeleted: boolean }>} The response from sever
 */
async function useDeleteFetch(uri: string): Promise<{ isDeleted: boolean }> {
  let isDeleted: boolean = false;
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
      isDeleted = true;
    }
  } catch (error) {
    console.error(error);
  }

  return { isDeleted };
}

export { usePostFetch, useDeleteFetch };
