import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaBirthdayCake, FaWeight } from "react-icons/fa";
import { toast } from "sonner";
import { usePets, useAddPet, useUpdatePet, usePetBreeds } from "@/hooks/usePets";
import { useForm } from "react-hook-form";

const Pets = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const { data: pets = [], isLoading } = usePets();
  const { data: breeds = [] } = usePetBreeds();
  const addPetMutation = useAddPet();
  const updatePetMutation = useUpdatePet();
  
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  // In hybrid model, pets are always unlimited for owners
  const canAddPet = true;

  const filteredPets = pets.filter(pet =>
    pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (pet.pet_breeds?.name || pet.custom_breed || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onAddPet = async (data: any) => {
    try {
      await addPetMutation.mutateAsync({
        name: data.name,
        breed_id: data.breed_id || null,
        custom_breed: data.custom_breed || null,
        date_of_birth: data.date_of_birth || null,
        gender: data.gender || null,
        weight: data.weight ? parseFloat(data.weight) : null,
        color: data.color || null,
        energy_level: data.energy_level || null,
        special_instructions: data.special_instructions || null,
        good_with_dogs: data.good_with_dogs !== undefined ? data.good_with_dogs : true,
        good_with_cats: data.good_with_cats !== undefined ? data.good_with_cats : true,
        good_with_children: data.good_with_children !== undefined ? data.good_with_children : true,
      });
      toast.success(`${data.name} has joined your pack! 🐕`, {
        description: "Ready for their first adventure!"
      });
      setIsAddDialogOpen(false);
      reset();
    } catch (error: any) {
      toast.error("Failed to add pet: " + error.message);
    }
  };

  const onEditPet = async (data: any) => {
    try {
      await updatePetMutation.mutateAsync({
        id: selectedPet.id,
        ...data,
        weight: data.weight ? parseFloat(data.weight) : null,
      });
      toast.success(`${data.name} updated successfully! ✨`);
      setIsEditDialogOpen(false);
      setSelectedPet(null);
      reset();
    } catch (error: any) {
      toast.error("Failed to update pet: " + error.message);
    }
  };

  const openEditDialog = (pet: any) => {
    setSelectedPet(pet);
    setValue('name', pet.name);
    setValue('breed_id', pet.breed_id);
    setValue('custom_breed', pet.custom_breed);
    setValue('date_of_birth', pet.date_of_birth);
    setValue('gender', pet.gender);
    setValue('weight', pet.weight);
    setValue('color', pet.color);
    setValue('energy_level', pet.energy_level);
    setValue('special_instructions', pet.special_instructions);
    setValue('good_with_dogs', pet.good_with_dogs);
    setValue('good_with_cats', pet.good_with_cats);
    setValue('good_with_children', pet.good_with_children);
    setIsEditDialogOpen(true);
  };

  const getEnergyEmoji = (energy: string | null) => {
    switch (energy) {
      case 'low': return '😴';
      case 'medium': return '🚶';
      case 'high': return '🏃';
      case 'very_high': return '⚡';
      default: return '🐕';
    }
  };

  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return 'Unknown age';
    const today = new Date();
    const birth = new Date(dateOfBirth);
    const months = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    
    if (months < 12) return `${months} months`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return remainingMonths > 0 ? `${years}y ${remainingMonths}m` : `${years} years`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-success/10">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-heading text-primary mb-2">
            Your Furry Family! 🐾
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your beloved pets and their adventures
          </p>
        </motion.div>

        {/* Search and Add */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-col sm:flex-row gap-4"
        >
          {/* Search Bar */}
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search your pets by name or breed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-fun w-full pl-10 pr-4"
            />
          </div>

          {/* Add Pet Button */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="magical" 
                size="lg" 
                className="flex items-center gap-2"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <FaPlus />
                Add New Pet 🐕
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Pet 🐾</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onAddPet)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Pet Name *</Label>
                    <Input {...register('name', { required: true })} placeholder="Buddy" />
                  </div>
                  <div>
                    <Label htmlFor="breed_id">Breed</Label>
                    <Select onValueChange={(value) => setValue('breed_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select breed" />
                      </SelectTrigger>
                      <SelectContent>
                        {breeds.map((breed) => (
                          <SelectItem key={breed.id} value={breed.id}>
                            {breed.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="custom_breed">Custom Breed (if not listed)</Label>
                    <Input {...register('custom_breed')} placeholder="Mixed breed" />
                  </div>
                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input {...register('date_of_birth')} type="date" />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select onValueChange={(value) => setValue('gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight (lbs)</Label>
                    <Input {...register('weight')} type="number" step="0.1" placeholder="25" />
                  </div>
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input {...register('color')} placeholder="Golden" />
                  </div>
                  <div>
                    <Label htmlFor="energy_level">Energy Level</Label>
                    <Select onValueChange={(value) => setValue('energy_level', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select energy level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low 😴</SelectItem>
                        <SelectItem value="medium">Medium 🚶</SelectItem>
                        <SelectItem value="high">High 🏃</SelectItem>
                        <SelectItem value="very_high">Very High ⚡</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="special_instructions">Special Instructions</Label>
                  <Textarea {...register('special_instructions')} placeholder="Any special care instructions..." />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <input {...register('good_with_dogs')} type="checkbox" defaultChecked />
                    <Label>Good with dogs</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input {...register('good_with_cats')} type="checkbox" defaultChecked />
                    <Label>Good with cats</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input {...register('good_with_children')} type="checkbox" defaultChecked />
                    <Label>Good with children</Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="fun" disabled={addPetMutation.isPending}>
                    {addPetMutation.isPending ? "Adding..." : "Add Pet 🐕"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Pets Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="fun-card animate-pulse">
                <div className="h-48 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredPets.map((pet, index) => (
              <motion.div
                key={pet.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="fun-card relative overflow-hidden"
              >
                {/* Pet Avatar and Energy Level */}
                <div className="text-center mb-4">
                  <div className="relative inline-block">
                    <div className="text-6xl mb-2">
                      {pet.avatar_url ? (
                        <img src={pet.avatar_url} alt={pet.name} className="w-16 h-16 rounded-full mx-auto" />
                      ) : (
                        getEnergyEmoji(pet.energy_level)
                      )}
                    </div>
                    {pet.energy_level && (
                      <div className="absolute -top-2 -right-2 text-2xl">
                        {getEnergyEmoji(pet.energy_level)}
                      </div>
                    )}
                  </div>
                  {pet.energy_level && (
                    <div className="text-sm font-medium text-primary capitalize">
                      {pet.energy_level.replace('_', ' ')} Energy
                    </div>
                  )}
                </div>

                {/* Pet Info */}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-heading text-primary mb-1">{pet.name}</h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    {pet.pet_breeds?.name || pet.custom_breed || 'Mixed Breed'}
                  </p>
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FaBirthdayCake />
                      <span>{calculateAge(pet.date_of_birth)}</span>
                    </div>
                    {pet.weight && (
                      <div className="flex items-center gap-1">
                        <FaWeight />
                        <span>{pet.weight} lbs</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pet Details */}
                {pet.color && (
                  <div className="text-center mb-4">
                    <span className="px-2 py-1 bg-success/20 text-success text-xs rounded-full">
                      {pet.color}
                    </span>
                  </div>
                )}

                {/* Behavior Tags */}
                <div className="flex flex-wrap gap-1 mb-4 justify-center">
                  {pet.good_with_dogs && (
                    <span className="px-2 py-1 bg-info/20 text-info text-xs rounded-full">
                      🐕 Dog Friendly
                    </span>
                  )}
                  {pet.good_with_cats && (
                    <span className="px-2 py-1 bg-warning/20 text-warning text-xs rounded-full">
                      🐱 Cat Friendly
                    </span>
                  )}
                  {pet.good_with_children && (
                    <span className="px-2 py-1 bg-success/20 text-success text-xs rounded-full">
                      👶 Kid Friendly
                    </span>
                  )}
                </div>

                {/* Special Instructions */}
                {pet.special_instructions && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-primary mb-1">📝 Special Notes:</h4>
                    <p className="text-xs text-muted-foreground">
                      {pet.special_instructions.substring(0, 100)}
                      {pet.special_instructions.length > 100 && '...'}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(pet)}
                  >
                    <FaEdit className="w-4 h-4" />
                  </Button>
                  <Button variant="fun" size="sm" className="flex-2" asChild>
                    <Link to={`/bookings/new?pet=${pet.id}`} className="flex items-center gap-1">
                      Book Walk
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && filteredPets.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🐕</div>
            <h3 className="text-xl font-heading text-primary mb-2">
              {searchQuery ? "No pets found" : "No pets added yet"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery 
                ? "Try adjusting your search to find your furry friends"
                : "Add your first pet to start your PupRoute adventure!"
              }
            </p>
            {!searchQuery && (
              <Button 
                variant="magical" 
                size="lg" 
                onClick={() => setIsAddDialogOpen(true)}
              >
                <FaPlus className="mr-2" />
                Add Your First Pet 🎉
              </Button>
            )}
          </motion.div>
        )}

        {/* AI Tip */}
        {!isLoading && filteredPets.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <div className="fun-card bg-gradient-to-r from-info/10 to-success/10 border border-info/20">
              <h3 className="text-lg font-heading text-primary mb-2 flex items-center gap-2">
                🤖 AI Pet Tip
              </h3>
              <p className="text-sm text-card-foreground">
                Based on your pets' activity levels, we recommend scheduling walks every 6-8 hours for optimal health and happiness! 
                Keep your furry friends active and happy with regular exercise.
              </p>
            </div>
          </motion.div>
        )}

        {/* Edit Pet Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit {selectedPet?.name} 🐾</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onEditPet)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Pet Name *</Label>
                  <Input {...register('name', { required: true })} />
                </div>
                <div>
                  <Label htmlFor="breed_id">Breed</Label>
                  <Select onValueChange={(value) => setValue('breed_id', value)} value={watch('breed_id')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select breed" />
                    </SelectTrigger>
                    <SelectContent>
                      {breeds.map((breed) => (
                        <SelectItem key={breed.id} value={breed.id}>
                          {breed.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="custom_breed">Custom Breed</Label>
                  <Input {...register('custom_breed')} />
                </div>
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input {...register('date_of_birth')} type="date" />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select onValueChange={(value) => setValue('gender', value)} value={watch('gender')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  <Input {...register('weight')} type="number" step="0.1" />
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input {...register('color')} />
                </div>
                <div>
                  <Label htmlFor="energy_level">Energy Level</Label>
                  <Select onValueChange={(value) => setValue('energy_level', value)} value={watch('energy_level')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select energy level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low 😴</SelectItem>
                      <SelectItem value="medium">Medium 🚶</SelectItem>
                      <SelectItem value="high">High 🏃</SelectItem>
                      <SelectItem value="very_high">Very High ⚡</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="special_instructions">Special Instructions</Label>
                <Textarea {...register('special_instructions')} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <input {...register('good_with_dogs')} type="checkbox" />
                  <Label>Good with dogs</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input {...register('good_with_cats')} type="checkbox" />
                  <Label>Good with cats</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input {...register('good_with_children')} type="checkbox" />
                  <Label>Good with children</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="fun" disabled={updatePetMutation.isPending}>
                  {updatePetMutation.isPending ? "Updating..." : "Update Pet ✨"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Floating Action Button */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
          className="fixed bottom-24 right-6 md:bottom-6 z-40"
        >
          <Button
            variant="magical"
            size="xl"
            className="rounded-full shadow-[var(--shadow-glow)] animate-pulse"
            onClick={() => setIsAddDialogOpen(true)}
          >
            🐕
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Pets;