namespace CRMBackend.Application.TodoItems.Queries.GetTodoItemsWithPagination;

public class GetTodoItemsQueryValidator : AbstractValidator<GetTodoItemsQuery>
{
    public GetTodoItemsQueryValidator()
    {
        RuleFor(x => x.ListId)
            .NotEmpty().WithMessage("ListId is required.");
    }
}
