defmodule SwayWeb.OrgView do
  use SwayWeb, :view
  alias SwayWeb.OrgView

  def render("index.json", %{orgs: orgs}) do
    %{data: render_many(orgs, OrgView, "org.json")}
  end

  def render("show.json", %{org: org}) do
    %{data: render_one(org, OrgView, "org.json")}
  end

  def render("org.json", %{org: org}) do
    %{
      id: org.id,
      name: org.name,
      domain: org.domain
    }
  end
end
