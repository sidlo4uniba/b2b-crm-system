using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;

namespace CRMBackend.Application.Common.Extensions;

internal class ParameterReplacer : ExpressionVisitor
{
    private readonly ParameterExpression _source;
    private readonly Expression _target;

    private ParameterReplacer(ParameterExpression source, Expression target)
    {
        _source = source;
        _target = target;
    }

    internal static Expression Replace(Expression expression, ParameterExpression source, Expression target)
    {
        return new ParameterReplacer(source, target).Visit(expression);
    }

    protected override Expression VisitParameter(ParameterExpression node)
    {
        return node == _source ? _target : base.VisitParameter(node);
    }
}

public static class SearchExtensions
{
    public static IQueryable<T> ApplySearch<T>(
        this IQueryable<T> query,
        string? search,
        params Expression<Func<T, string?>>[] propertiesToSearch)
    {
        if (string.IsNullOrWhiteSpace(search) || propertiesToSearch == null || propertiesToSearch.Length == 0)
        {
            return query;
        }

        var searchTerm = search.Trim().ToLower();

        ParameterExpression parameter = Expression.Parameter(typeof(T), "entity");
        Expression? combinedOrExpression = null;

        var containsMethod = typeof(string).GetMethod("Contains", new[] { typeof(string) });
        var toLowerMethod = typeof(string).GetMethod("ToLower", Type.EmptyTypes);

        if (containsMethod == null || toLowerMethod == null)
        {
            throw new InvalidOperationException("Required string methods (Contains, ToLower) not found.");
        }

        var searchTermConstant = Expression.Constant(searchTerm);

        foreach (var propertyLambda in propertiesToSearch)
        {
            var propertyBody = ParameterReplacer.Replace(propertyLambda.Body, propertyLambda.Parameters[0], parameter);

            Expression? nullCheckChain = null;
            Expression currentExpr = propertyBody;

            if (currentExpr is MemberExpression memberExpr)
            {
                Expression? parentExpr = memberExpr.Expression;
                while (parentExpr != null && parentExpr.NodeType != ExpressionType.Parameter)
                {
                    var parentNotNull = Expression.NotEqual(parentExpr, Expression.Constant(null, parentExpr.Type));
                    nullCheckChain = nullCheckChain == null ? parentNotNull : Expression.AndAlso(parentNotNull, nullCheckChain);

                    parentExpr = (parentExpr as MemberExpression)?.Expression;
                }
            }

            var finalPropertyNotNull = Expression.NotEqual(propertyBody, Expression.Constant(null, propertyBody.Type));
            nullCheckChain = nullCheckChain == null ? finalPropertyNotNull : Expression.AndAlso(nullCheckChain, finalPropertyNotNull);


            var toLowerCall = Expression.Call(propertyBody, toLowerMethod);
            var containsCall = Expression.Call(toLowerCall, containsMethod, searchTermConstant);
            var fullCondition = Expression.AndAlso(nullCheckChain, containsCall);

            if (combinedOrExpression == null)
            {
                combinedOrExpression = fullCondition;
            }
            else
            {
                combinedOrExpression = Expression.OrElse(combinedOrExpression, fullCondition);
            }
        }

        if (combinedOrExpression == null)
        {
             return query;
        }

        var finalLambda = Expression.Lambda<Func<T, bool>>(combinedOrExpression, parameter);
        return query.Where(finalLambda);
    }
}
