defmodule SwayWeb.Hashing do
  @alphabet "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_"
  @salt "sw:ay"
  @min_length 4

  def encode_workspace(id), do: encode(1, id)
  def decode_workspace(id), do: decode(id)
  def encode_room(id), do: encode(2, id)
  def decode_room(id), do: decode(id)
  def encode_user(id), do: encode(3, id)
  def decode_user(id), do: decode(id)
  def encode_status(id), do: encode(4, id)
  def decode_status(id), do: decode(id)
  def encode_private_member(id), do: encode(5, id)
  def decode_private_member(id), do: decode(id)
  def encode_membership(id), do: encode(6, id)
  def decode_membership(id), do: decode(id)

  def decode_any(hash) do
    hd(Hashids.decode!(provider(), hash))
  end

  defp encode(entity_salt, id) do
    Hashids.encode(provider(), [id, entity_salt])
  end

  defp decode(hash) do
    hd(Hashids.decode!(provider(), hash))
  end

  defp provider() do
    Hashids.new(salt: @salt, alphabet: @alphabet, min_len: @min_length)
  end
end
