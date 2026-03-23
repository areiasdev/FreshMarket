namespace FreshMarket.Application.Common.Exceptions;

public class ForbiddenAccessException : Exception
{
    public ForbiddenAccessException() : base("Acesso negado.") { }
}
