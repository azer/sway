defmodule SwayWeb.PostController do
  use SwayWeb, :controller

  alias Sway.Blog
  alias Sway.Blog.Post

  def index(conn, _params) do
    blog_posts =
      Blog.list_blog_posts()
    render(conn, "index.html", blog_posts: blog_posts, page_title: "Blog")
  end

  def new(conn, _params) do
    changeset = Blog.change_post(%Post{})
    render(conn, "new.html", changeset: changeset)
  end

  def create(conn, %{"post" => post_params}) do
    case Blog.create_post(post_params) do
      {:ok, post} ->
        conn
        |> put_flash(:info, "Post created successfully.")
        |> redirect(to: Routes.post_path(conn, :show, post))

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end

  def show(conn, %{"id" => slug_id}) do
    id = if String.contains?(slug_id, "-") do
      encoded_id = hd String.split(slug_id, "-", parts: 2)
      try do
	SwayWeb.Hashing.decode_blog(encoded_id)
      rescue
	ArgumentError ->
	  conn
       |> put_status(:not_found)
       |> json(%{error: "Not found"})
      end

      SwayWeb.Hashing.decode_blog(encoded_id)
    else
      slug_id
    end

    post =
      Blog.get_post!(id)

    render(conn, "show.html", post: post)
  end

  def edit(conn, %{"id" => id}) do
    post = Blog.get_post!(id)
    changeset = Blog.change_post(post)
    render(conn, "edit.html", post: post, changeset: changeset)
  end

  def update(conn, %{"id" => id, "post" => post_params}) do
    post = Blog.get_post!(id)

    case Blog.update_post(post, post_params) do
      {:ok, post} ->
        conn
        |> put_flash(:info, "Post updated successfully.")
        |> redirect(to: Routes.post_path(conn, :show, post))

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "edit.html", post: post, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    post = Blog.get_post!(id)
    {:ok, _post} = Blog.delete_post(post)

    conn
    |> put_flash(:info, "Post deleted successfully.")
    |> redirect(to: Routes.post_path(conn, :index))
  end
end
