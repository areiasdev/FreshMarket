namespace FreshMarket.Application.Common.Exceptions;

public class NotFoundException : Exception
{
    public NotFoundException(string name, object key)
        : base($"'{name}' com id '{key}' não foi encontrado.") { }
}
