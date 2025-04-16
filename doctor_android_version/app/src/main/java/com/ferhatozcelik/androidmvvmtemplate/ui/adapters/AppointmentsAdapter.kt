package com.ferhatozcelik.androidmvvmtemplate.ui.adapters

import android.content.res.ColorStateList
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.ferhatozcelik.androidmvvmtemplate.R
import com.ferhatozcelik.androidmvvmtemplate.data.supabase.Appointment
import com.ferhatozcelik.androidmvvmtemplate.databinding.ItemAppointmentBinding

class AppointmentsAdapter(
    private val onAppointmentClicked: (Appointment) -> Unit
) : ListAdapter<Appointment, AppointmentsAdapter.AppointmentViewHolder>(AppointmentDiffCallback()) {

    // Map to cache patient names by patient ID
    private val patientNames = mutableMapOf<String, String>()

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): AppointmentViewHolder {
        val binding = ItemAppointmentBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return AppointmentViewHolder(binding)
    }

    override fun onBindViewHolder(holder: AppointmentViewHolder, position: Int) {
        val appointment = getItem(position)
        holder.bind(appointment)
    }

    // Function to update patient names cache
    fun updatePatientName(patientId: String, name: String) {
        patientNames[patientId] = name
        notifyDataSetChanged() // Update UI with new patient names
    }

    inner class AppointmentViewHolder(private val binding: ItemAppointmentBinding) :
        RecyclerView.ViewHolder(binding.root) {

        init {
            binding.root.setOnClickListener {
                val currentPosition = bindingAdapterPosition
                if (currentPosition != RecyclerView.NO_POSITION) {
                    onAppointmentClicked(getItem(currentPosition))
                }
            }
        }

        fun bind(appointment: Appointment) {
            val context = binding.root.context
            
            // Set patient name from cache or display patient ID
            binding.textViewPatientName.text = patientNames[appointment.patient_id] ?: "Patient ${appointment.patient_id.take(8)}"
            
            // Set appointment date and time
            binding.textViewAppointmentDate.text = appointment.getFormattedDate()
            binding.textViewAppointmentTime.text = appointment.getFormattedTime()
            
            // Set appointment status with appropriate color
            binding.textViewAppointmentStatus.text = appointment.status.capitalize()
            
            // Set status background color based on appointment status
            val backgroundDrawableRes = when(appointment.status.lowercase()) {
                Appointment.STATUS_SCHEDULED -> R.drawable.status_scheduled_background
                Appointment.STATUS_CONFIRMED -> R.drawable.status_confirmed_background
                Appointment.STATUS_COMPLETED -> R.drawable.status_confirmed_background
                Appointment.STATUS_CANCELLED -> R.drawable.status_cancelled_background
                Appointment.STATUS_NO_SHOW -> R.drawable.status_cancelled_background
                else -> R.drawable.status_scheduled_background
            }
            binding.textViewAppointmentStatus.setBackgroundResource(backgroundDrawableRes)
            
            // Set appointment reason/type
            binding.textViewAppointmentType.text = appointment.reason ?: "General Checkup"
        }
    }

    private class AppointmentDiffCallback : DiffUtil.ItemCallback<Appointment>() {
        override fun areItemsTheSame(oldItem: Appointment, newItem: Appointment): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: Appointment, newItem: Appointment): Boolean {
            return oldItem == newItem
        }
    }
    
    private fun String.capitalize(): String {
        return this.replaceFirstChar { if (it.isLowerCase()) it.titlecase() else it.toString() }
    }
} 