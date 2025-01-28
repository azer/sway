defmodule Sway.Repo.Migrations.CreateBlogPosts do
  use Ecto.Migration

  def change do
    create table(:blog_posts) do
      add :title, :string
      add :body, :text
      add :draft, :boolean, default: false, null: false
      add :changelog, :boolean, default: false, null: false
      add :author_id, references(:users, on_delete: :nothing)
      add :workspace_id, references(:workspaces, on_delete: :nothing)

      timestamps()
    end

    create index(:blog_posts, [:author_id])
    create index(:blog_posts, [:workspace_id])
  end
end
