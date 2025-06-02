using Ardalis.GuardClauses;
using CRMBackend.Application.Common.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using MediatR;
using CRMBackend.Application.Common.Exceptions;
using CRMBackend.Domain.AggregateRoots.KategoriaProduktuAggregate;

namespace CRMBackend.Application.KategorieProduktovAggregate.Commands.KategorieProduktov.DeleteKategorieProduktov;

public record DeleteKategorieProduktovCommand : IRequest
{
    public required int Id { get; init; }
}

public class DeleteKategorieProduktovCommandHandler : IRequestHandler<DeleteKategorieProduktovCommand>
{
    private readonly IWriteRepository<KategoriaProduktu> _repository;

    public DeleteKategorieProduktovCommandHandler(IWriteRepository<KategoriaProduktu> repository)
    {
        _repository = repository;
    }

    public async Task Handle(DeleteKategorieProduktovCommand request, CancellationToken cancellationToken)
    {
        var kategorieProduktov = await _repository.GetByIdAsync(request.Id, cancellationToken);
        Guard.Against.NotFound(request.Id, kategorieProduktov);
        
        _repository.Delete(kategorieProduktov);
        await _repository.SaveAsync(cancellationToken);
    }
} 
