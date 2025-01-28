defmodule SwayWeb.PostView do
  use SwayWeb, :view

  alias Earmark

  def markdown_to_html(markdown) do
    {:ok, html, _} = Earmark.as_html(markdown)
    {:safe, html}
  end

  def format_date(date) do
    Timex.format!(date, "%b %d, %Y", :strftime)
  end

  def url(id, title) do
    "/blog/#{SwayWeb.Hashing.encode_blog(id)}-#{Slug.slugify(title)}"
  end
end
