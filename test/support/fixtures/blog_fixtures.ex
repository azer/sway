defmodule Sway.BlogFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Sway.Blog` context.
  """

  @doc """
  Generate a post.
  """
  def post_fixture(attrs \\ %{}) do
    {:ok, post} =
      attrs
      |> Enum.into(%{
        body: "some body",
        changelog: true,
        draft: true,
        title: "some title"
      })
      |> Sway.Blog.create_post()

    post
  end
end
