defmodule BafaWeb.OrgView do
  use BafaWeb, :view
  alias BafaWeb.OrgView

  def render("index.json", %{statuses: statuses}) do
    %{data: render_many(statuses, StatusView, "org.json")}
  end

  def render("show.json", %{status: status}) do
    %{data: render_one(statuses, StatusView, "org.json")}
  end

  def render("status.json", %{status: status}) do
    %{
      id: status.id,
      mode: status.mode,
      created_at: status.created_at
    }
  end
end
